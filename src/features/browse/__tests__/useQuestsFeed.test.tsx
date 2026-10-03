import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useQuestsFeed, type UseQuestsFeedParams } from "../useQuestsFeed";

function makeWrapper() {
  // gcTime: 0 evicts a query's cache the instant its last observer unmounts
  // instead of scheduling react-query's default 5-minute GC timer — without
  // this, that timer is an open handle that keeps the Jest process (and any
  // CI run) hanging well past the test's own assertions finishing.
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

function useHarness(params?: UseQuestsFeedParams) {
  const auth = useAuthSession();
  const feed = useQuestsFeed(params);
  return { auth, feed };
}

async function renderSignedIn(params?: UseQuestsFeedParams) {
  const { result } = await renderHook(() => useHarness(params), { wrapper: makeWrapper() });
  await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
  await act(() => result.current.auth.signInWithGoogle());
  await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));
  await waitFor(() => expect(result.current.feed.isLoading).toBe(false), { timeout: 3000 });
  return result;
}

describe("useQuestsFeed", () => {
  it("does not query until a session is signed in", async () => {
    const { result } = await renderHook(() => useHarness(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
    // Disabled queries (no session yet) are pending, not actively fetching —
    // react-query's isLoading only flips true once a fetch actually starts.
    expect(result.current.feed.quests).toEqual([]);
    expect(result.current.feed.isError).toBe(false);
  });

  it("loads the open quests within the signed-in user's default radius", async () => {
    const result = await renderSignedIn();
    expect(result.current.feed.isError).toBe(false);
    expect(result.current.feed.quests.length).toBeGreaterThan(0);
    expect(result.current.feed.quests.every((q) => q.status === "open")).toBe(true);
  });

  it("search narrows the result set", async () => {
    const result = await renderSignedIn({ search: "wardrobe" });
    expect(result.current.feed.quests).toHaveLength(1);
    expect(result.current.feed.quests[0].title).toMatch(/wardrobe/i);
  });

  it("categoryId narrows the result set", async () => {
    const result = await renderSignedIn({ categoryId: "delivery" });
    expect(result.current.feed.quests.length).toBeGreaterThan(0);
    expect(result.current.feed.quests.every((q) => q.categoryId === "delivery")).toBe(true);
  });

  it("exposes the signed-in user's saved quest ids", async () => {
    const result = await renderSignedIn();
    expect(result.current.feed.savedIds instanceof Set).toBe(true);
  });
});
