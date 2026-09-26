import React, { useEffect, useState } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { BrowseScreen } from "../BrowseScreen";

/* Real FlashList (v2, New Architecture only) runs its own RecyclerView
   frame scheduler that keeps re-scheduling itself via the RN scheduler's
   Immediate — under react-test-renderer that scheduler never tears down
   on unmount, leaving Jest's process unable to exit even after every
   assertion has long since passed. Swapped for a trivial plain-View list
   here so this file tests BrowseScreen's own logic (hooks, rendering,
   handlers), not FlashList's virtualization internals — those are a
   third-party concern, and get real coverage from the Playwright pass
   against the web export instead (ADR-008). */
jest.mock("@shopify/flash-list", () => {
  function FlashList(props: any) {
    // jest.mock's factory can't reference this file's own top-level imports
    // (babel-plugin-jest-hoist), so react-native is required lazily instead.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require("react-native");
    const { data, renderItem, keyExtractor, ListHeaderComponent: Header, ListEmptyComponent: Empty, ListFooterComponent: Footer } = props;
    return (
      <View>
        {Header ? <Header /> : null}
        {data.length === 0 && Empty ? <Empty /> : null}
        {data.map((item: any, index: number) => (
          <View key={keyExtractor ? keyExtractor(item, index) : index}>{renderItem({ item, index })}</View>
        ))}
        {Footer ? <Footer /> : null}
      </View>
    );
  }
  return { FlashList };
});

// The signed-in user's feed round-trips through getUser (for `home`) and
// listQuests sequentially, each carrying the memory adapter's own
// 120-400ms simulated latency — comfortably past RNTL's 1000ms default
// findBy timeout, so every findBy* below gets a longer one explicitly.
const LONG_TIMEOUT = { timeout: 5000 };

function SignInOnMount({ children }: { children: React.ReactNode }) {
  const { status, signInWithGoogle } = useAuthSession();
  useEffect(() => {
    if (status === "signedOut") signInWithGoogle();
  }, [status, signInWithGoogle]);
  return <>{children}</>;
}

function Providers({ children }: { children: React.ReactNode }) {
  // gcTime: 0 avoids react-query's default 5-minute GC timer outliving the
  // test (see useQuestsFeed.test.tsx's identical comment).
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>
        <AuthSessionProvider>
          <SignInOnMount>{children}</SignInOnMount>
        </AuthSessionProvider>
      </RepositoryProvider>
    </QueryClientProvider>
  );
}

describe("BrowseScreen", () => {
  it("renders with no console warnings/errors once the feed loads", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { findByText } = await render(<BrowseScreen />, { wrapper: Providers });
    await findByText("Assemble a wardrobe (2 boxes)", {}, LONG_TIMEOUT);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders the open quests near the signed-in user", async () => {
    const { findByText } = await render(<BrowseScreen />, { wrapper: Providers });
    expect(await findByText("Assemble a wardrobe (2 boxes)", {}, LONG_TIMEOUT)).toBeTruthy();
    expect(await findByText("Set up a printer and show me how it works", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("search narrows the visible list", async () => {
    const { findByText, findByTestId, queryByText } = await render(<BrowseScreen />, { wrapper: Providers });
    await findByText("Assemble a wardrobe (2 boxes)", {}, LONG_TIMEOUT);

    const search = await findByTestId("browse-search", {}, LONG_TIMEOUT);
    await fireEvent.changeText(search, "wardrobe");

    await waitFor(() => expect(queryByText("Set up a printer and show me how it works")).toBeNull(), LONG_TIMEOUT);
    expect(await findByText("Assemble a wardrobe (2 boxes)", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("a category chip narrows the visible list", async () => {
    const { findByText, findByTestId, queryByText } = await render(<BrowseScreen />, { wrapper: Providers });
    await findByText("Assemble a wardrobe (2 boxes)", {}, LONG_TIMEOUT);

    const deliveryChip = await findByTestId("browse-category-delivery", {}, LONG_TIMEOUT);
    await fireEvent.press(deliveryChip);

    await waitFor(() => expect(queryByText("Assemble a wardrobe (2 boxes)")).toBeNull(), LONG_TIMEOUT);
    expect(await findByText("Pick up a parcel from the post office", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("pressing a quest's save button flips it, optimistically then for real", async () => {
    const { findByText, findAllByLabelText } = await render(<BrowseScreen />, { wrapper: Providers });
    await findByText("Assemble a wardrobe (2 boxes)", {}, LONG_TIMEOUT);

    const saveButtons = await findAllByLabelText("Save quest", {}, LONG_TIMEOUT);
    const first = saveButtons[0];
    expect(first.props.accessibilityState.selected).toBe(false);

    await fireEvent.press(first);
    // Waited out fully (not just fired) so the mutation's own real latency
    // resolves inside this test's async scope, rather than leaking a
    // dangling timer past the test's return.
    await waitFor(() => expect(first.props.accessibilityState.selected).toBe(true), LONG_TIMEOUT);
  });
});
