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
  it("counts poster+open-with-pending-offers, poster+completed, and doer+assigned/in_progress engagements", async () => {
    const { result } = await renderHook(() => useHarness(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
    await act(() => result.current.auth.signInWithGoogle());
    await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));

    // u0's fixture: q1 (doer, in_progress) + q11 (doer, assigned) + q6
    // (poster, open, 3 pending offers) + q7 (poster, completed — real
    // "Confirm and pay" since M5) = 4. q8/q9 (doer, paid/cancelled) are
    // excluded (closed); paid+unrated ("Leave a rating") stays M6.
    await waitFor(() => expect(result.current.count).toBe(4), { timeout: 3000 });
  });
});
