import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider, setFaultInjectionRate } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useQuestsFeed } from "../useQuestsFeed";
import { useSaveQuest } from "../useSaveQuest";

function makeWrapper() {
  // See useQuestsFeed.test.tsx's identical comment: gcTime: 0 avoids
  // react-query's default 5-minute GC timer outliving the test.
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
  const feed = useQuestsFeed();
  const save = useSaveQuest();
  return { auth, feed, save };
}

async function renderSignedIn() {
  const { result } = await renderHook(() => useHarness(), { wrapper: makeWrapper() });
  await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
  await act(() => result.current.auth.signInWithGoogle());
  await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));
  await waitFor(() => expect(result.current.feed.isLoading).toBe(false), { timeout: 3000 });
  return result;
}

describe("useSaveQuest", () => {
  afterEach(() => setFaultInjectionRate(0));

  it("optimistically saves, then confirms after the mutation resolves", async () => {
    const result = await renderSignedIn();
    expect(result.current.feed.savedIds.has("q2")).toBe(false);

    await act(() => result.current.save.toggleSave("q2", false));
    await waitFor(() => expect(result.current.feed.savedIds.has("q2")).toBe(true), { timeout: 3000 });

    // Leave the fixture as found for other tests in this file.
    await act(() => result.current.save.toggleSave("q2", true));
    await waitFor(() => expect(result.current.feed.savedIds.has("q2")).toBe(false), { timeout: 3000 });
  });

  it("rolls back the optimistic update when the mutation fails", async () => {
    const result = await renderSignedIn();
    expect(result.current.feed.savedIds.has("q3")).toBe(false);

    setFaultInjectionRate(1);
    await act(() => result.current.save.toggleSave("q3", false));

    // Optimistic flip happens immediately...
    await waitFor(() => expect(result.current.feed.savedIds.has("q3")).toBe(true), { timeout: 1000 });
    // ...then rolls back once the injected fault rejects the mutation.
    await waitFor(() => expect(result.current.feed.savedIds.has("q3")).toBe(false), { timeout: 3000 });
  });
});
