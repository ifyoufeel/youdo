import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useActionableCount } from "../useActionableCount";

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
  const count = useActionableCount();
  return { auth, count };
}

describe("useActionableCount", () => {
  it("counts only poster+open-with-pending-offers and doer+assigned/in_progress engagements", async () => {
    const { result } = await renderHook(() => useHarness(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
    await act(() => result.current.auth.signInWithGoogle());
    await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));

    // u0's fixture: q1 (doer, in_progress) + q11 (doer, assigned) + q6
    // (poster, open, 3 pending offers) = 3. q7 (poster, completed) and
    // q8/q9 (doer, paid/cancelled) are excluded — the M5/M6-scoped
    // branches useActionableCount's own header comment names as
    // deliberately out of scope for M4.
    await waitFor(() => expect(result.current.count).toBe(3), { timeout: 3000 });
  });
});
