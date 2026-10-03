import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useUnreadThreadCount } from "../useUnreadThreadCount";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </RepositoryProvider>
      </QueryClientProvider>
    );
  };
}

function useHarness() {
  const auth = useAuthSession();
  const count = useUnreadThreadCount();
  return { auth, count };
}

describe("useUnreadThreadCount", () => {
  it("sums unreadCountForThread across every one of u0's threads", async () => {
    const { result } = await renderHook(() => useHarness(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
    await act(() => result.current.auth.signInWithGoogle());
    await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));

    // t-q1-u0 has 2 unread (per threads.test.ts's own truth table) +
    // t-q6-u5 has 1 (no prior threadReadAt entry for u0) = 3; every other
    // thread is fully read.
    await waitFor(() => expect(result.current.count).toBe(3), { timeout: 3000 });
  });
});
