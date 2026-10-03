import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useSavedQuests } from "../useSavedQuests";

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
  const saved = useSavedQuests();
  return { auth, saved };
}

async function renderSignedIn() {
  const { result } = await renderHook(() => useHarness(), { wrapper: makeWrapper() });
  await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
  await act(() => result.current.auth.signInWithGoogle());
  await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));
  await waitFor(() => expect(result.current.saved.isLoading).toBe(false), { timeout: 3000 });
  return result;
}

describe("useSavedQuests", () => {
  it("resolves u0's real seeded saved quest (q4) with its poster", async () => {
    const result = await renderSignedIn();
    expect(result.current.saved.quests.map((q) => q.id)).toEqual(["q4"]);
    await waitFor(() => expect(result.current.saved.posters.get("u4")?.name).toBeTruthy(), { timeout: 3000 });
  });
});
