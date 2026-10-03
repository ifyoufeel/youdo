import React, { useEffect, useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { CustomTabBar } from "../_layout";

const LONG_TIMEOUT = { timeout: 5000 };

function SignInOnMount({ children }: { children: React.ReactNode }) {
  const { status, signInWithGoogle } = useAuthSession();
  useEffect(() => {
    if (status === "signedOut") signInWithGoogle();
  }, [status, signInWithGoogle]);
  if (status !== "signedIn") return null;
  return <>{children}</>;
}

function Providers({ children }: { children: React.ReactNode }) {
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

function makeState(index: number) {
  return {
    routes: [
      { key: "index", name: "index" },
      { key: "quests", name: "quests" },
      { key: "post", name: "post" },
      { key: "chats", name: "chats" },
      { key: "profile", name: "profile" },
    ],
    index,
  };
}

describe("CustomTabBar", () => {
  it(
    "renders with no console warnings/errors",
    async () => {
      const error = jest.spyOn(console, "error").mockImplementation(() => {});
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      const { findByLabelText } = await render(
        <CustomTabBar state={makeState(0)} navigation={{ navigate: () => {} }} />,
        { wrapper: Providers }
      );
      await findByLabelText("Browse", {}, LONG_TIMEOUT);
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
      error.mockRestore();
      warn.mockRestore();
    },
    15000
  );

  it(
    "renders all 5 tab labels in order",
    async () => {
      const { findByLabelText } = await render(
        <CustomTabBar state={makeState(0)} navigation={{ navigate: () => {} }} />,
        { wrapper: Providers }
      );
      for (const label of ["Browse", "My quests", "Post", "Chats", "Profile"]) {
        expect(await findByLabelText(label, {}, LONG_TIMEOUT)).toBeTruthy();
      }
    },
    15000
  );

  it(
    "marks the route at state.index as selected",
    async () => {
      const { findByLabelText } = await render(
        <CustomTabBar state={makeState(2)} navigation={{ navigate: () => {} }} />,
        { wrapper: Providers }
      );
      expect((await findByLabelText("Post", {}, LONG_TIMEOUT)).props.accessibilityState.selected).toBe(true);
      expect((await findByLabelText("Browse", {}, LONG_TIMEOUT)).props.accessibilityState.selected).toBe(false);
    },
    15000
  );

  it(
    "calls navigation.navigate with the pressed route's name",
    async () => {
      const navigate = jest.fn();
      const { findByLabelText } = await render(
        <CustomTabBar state={makeState(0)} navigation={{ navigate }} />,
        { wrapper: Providers }
      );
      await fireEvent.press(await findByLabelText("Chats", {}, LONG_TIMEOUT));
      expect(navigate).toHaveBeenCalledWith("chats");
    },
    15000
  );

  it(
    "shows real badge counts on My quests and Chats, not placeholders",
    async () => {
      // u0's seed fixture: q1 (doer, in_progress) + q11 (doer, assigned)
      // + q6 (poster, open with 3 pending offers) + q7 (poster, completed
      // — real "Confirm and pay" since M5) = actionableCount 4. Unread:
      // t-q1-u0 has 2 (per threads.test.ts's own truth table) + t-q6-u5
      // has 1 (never read) = unreadThreadCount 3 (t-q11-u0 is already
      // read in the fixture, contributing 0). Both cross-checked against
      // src/data/adapters/memory/__tests__/threads.test.ts's own numbers.
      const { findByText } = await render(
        <CustomTabBar state={makeState(0)} navigation={{ navigate: () => {} }} />,
        { wrapper: Providers }
      );
      expect(await findByText("4", {}, LONG_TIMEOUT)).toBeTruthy();
      expect(await findByText("3", {}, LONG_TIMEOUT)).toBeTruthy();
    },
    15000
  );
});
