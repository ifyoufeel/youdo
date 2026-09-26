import React, { useEffect } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { PostQuestScreen } from "../PostQuestScreen";

const LONG_TIMEOUT = { timeout: 5000 };

// Mirrors app/index.tsx's real cold-start gate: a screen behind auth
// never mounts until status is "signedIn" — same fix QuestDetailScreen's
// own test harness needed in M2 (a race otherwise lets the screen render
// with a null session for a beat).
function SignInOnMount({ children }: { children: React.ReactNode }) {
  const { status, signInWithGoogle } = useAuthSession();
  useEffect(() => {
    if (status === "signedOut") signInWithGoogle();
  }, [status, signInWithGoogle]);
  if (status !== "signedIn") return null;
  return <>{children}</>;
}

function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
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

describe("PostQuestScreen", () => {
  it("renders the What step with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { findByText } = await render(<PostQuestScreen />, { wrapper: Providers });

    await findByText("What needs doing?", {}, LONG_TIMEOUT);
    expect(await findByText("Category", {}, LONG_TIMEOUT)).toBeTruthy();

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("blocks advancing past What on a too-short title, showing the error only after trying", async () => {
    const { findByText, getByTestId, queryByText } = await render(<PostQuestScreen />, { wrapper: Providers });
    await findByText("What needs doing?", {}, LONG_TIMEOUT);

    expect(queryByText("Give it a few more words so doers know what's involved")).toBeNull();
    await fireEvent.press(getByTestId("post-next"));
    expect(
      await findByText("Give it a few more words so doers know what's involved", {}, LONG_TIMEOUT)
    ).toBeTruthy();
    // Still on the What step — the title input is still there.
    expect(await findByText("What needs doing?", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("advances to Where & when once the title is long enough", async () => {
    const { findByText, getByTestId } = await render(<PostQuestScreen />, { wrapper: Providers });
    await findByText("What needs doing?", {}, LONG_TIMEOUT);

    await fireEvent.changeText(getByTestId("post-title"), "Walk my dog for an hour");
    await fireEvent.press(getByTestId("post-next"));

    expect(await findByText("Address", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("blocks Where & when on a missing address or date/time", async () => {
    const { findByText, getByTestId } = await render(<PostQuestScreen />, { wrapper: Providers });
    await findByText("What needs doing?", {}, LONG_TIMEOUT);
    await fireEvent.changeText(getByTestId("post-title"), "Walk my dog for an hour");
    await fireEvent.press(getByTestId("post-next"));
    await findByText("Address", {}, LONG_TIMEOUT);

    await fireEvent.press(getByTestId("post-next"));
    expect(await findByText("Add an address so doers know how far it is", {}, LONG_TIMEOUT)).toBeTruthy();
    expect(await findByText("Pick a date and a time", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it(
    "walks the full wizard and resets to step one after a successful submit",
    async () => {
      const { findByText, getByTestId } = await render(<PostQuestScreen />, { wrapper: Providers });

      // What
      await findByText("What needs doing?", {}, LONG_TIMEOUT);
      await fireEvent.changeText(getByTestId("post-title"), "Assemble a bookshelf");
      await fireEvent.press(getByTestId("post-next"));

      // Where & when
      await findByText("Address", {}, LONG_TIMEOUT);
      await fireEvent.changeText(getByTestId("post-address"), "14B, Lane 31, Yongkang St");
      await fireEvent.press(getByTestId("post-date"));
      await fireEvent.press(await findByText("Today", {}, LONG_TIMEOUT));
      await fireEvent.press(getByTestId("post-time"));
      await fireEvent.press(await findByText("6:00 PM", {}, LONG_TIMEOUT));
      await fireEvent.press(getByTestId("post-next"));

      // Budget
      await findByText("Price", {}, LONG_TIMEOUT);
      await fireEvent.changeText(getByTestId("post-budget"), "600");
      await fireEvent.press(getByTestId("post-next"));

      // Review — "NT$600" appears twice (the RewardPill and FeeBreakdown's
      // "Quest price" row), so this checks for at least one rather than
      // using findByText, which throws on more than a single match.
      expect(await findByText("Assemble a bookshelf", {}, LONG_TIMEOUT)).toBeTruthy();
      expect(await findByText("Before you post", {}, LONG_TIMEOUT)).toBeTruthy();
      await fireEvent.press(getByTestId("post-submit"));

      // Back to a fresh What step once the mutation succeeds.
      expect(await findByText("What needs doing?", {}, LONG_TIMEOUT)).toBeTruthy();
      expect(getByTestId("post-title").props.value).toBe("");
    },
    15000
  );
});
