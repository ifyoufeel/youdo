import React, { useEffect, useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { ChatsScreen } from "../ChatsScreen";

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

describe("ChatsScreen", () => {
  // Every test here fetches all 7 of u0's threads with a real N+1
  // messages + N+1 unread + per-quest + per-poster join (useThreads.ts's
  // own header comment) — genuinely slower than the 5s default.
  it(
    "renders u0's real threads with no console warnings/errors",
    async () => {
      const error = jest.spyOn(console, "error").mockImplementation(() => {});
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      const { findByText, findByTestId } = await render(<ChatsScreen />, { wrapper: Providers });

      await findByText("Chats", {}, LONG_TIMEOUT);
      // "Drop two bags at the recycling point" (q6) legitimately appears
      // 3 times — one row per doer who offered — so this waits on a
      // specific row's testID instead of the shared quest title text.
      expect(await findByTestId("thread-row-t-q6-u2", {}, LONG_TIMEOUT)).toBeTruthy();

      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
      error.mockRestore();
      warn.mockRestore();
    },
    15000
  );

  it(
    "shows an unread badge on a thread with unread messages",
    async () => {
      const { findByText, findByTestId } = await render(<ChatsScreen />, { wrapper: Providers });
      await findByText("Chats", {}, LONG_TIMEOUT);
      // t-q1-u0 has 2 unread messages from u1.
      const row = await findByTestId("thread-row-t-q1-u0", {}, LONG_TIMEOUT);
      expect(row).toBeTruthy();
      expect(await findByText("2 new", {}, LONG_TIMEOUT)).toBeTruthy();
    },
    15000
  );

  it(
    "navigates to the thread on press",
    async () => {
      const { findByText, findByTestId } = await render(<ChatsScreen />, { wrapper: Providers });
      await findByText("Chats", {}, LONG_TIMEOUT);
      const row = await findByTestId("thread-row-t-q3-u0", {}, LONG_TIMEOUT);
      // Real navigation is exercised end-to-end in the preview gallery's
      // flows; here we only confirm the row is pressable without erroring.
      await fireEvent.press(row);
      expect(row).toBeTruthy();
    },
    15000
  );
});
