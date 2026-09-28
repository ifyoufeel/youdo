import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useThreads } from "../useThreads";
import { useThread } from "../useThread";
import { useSendMessage } from "../useSendMessage";

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

async function signIn<T extends { auth: ReturnType<typeof useAuthSession> }>(
  useHarness: () => T,
  isLoading: (r: T) => boolean
) {
  const { result } = await renderHook(useHarness, { wrapper: makeWrapper() });
  await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
  await act(() => result.current.auth.signInWithGoogle());
  await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));
  await waitFor(() => expect(isLoading(result.current)).toBe(false), { timeout: 3000 });
  return result;
}

describe("useThreads", () => {
  // A bare useThreads harness — no useThread mounted alongside it, since
  // that would itself mark a thread read and shift the very unread
  // counts this test is checking.
  function useHarness() {
    return { auth: useAuthSession(), threads: useThreads() };
  }

  it("lists u0's threads newest-activity-first, each with a resolved counterpart and unread count", async () => {
    const result = await signIn(useHarness, (r) => r.threads.isLoading);
    const ids = result.current.threads.summaries.map((s) => s.thread.id);
    expect(ids).toEqual(["t-q3-u0", "t-q1-u0", "t-q6-u2", "t-q6-u3", "t-q6-u5", "t-q11-u0", "t-q7-u5", "t-q8-u0"]);

    const t1 = result.current.threads.summaries.find((s) => s.thread.id === "t-q1-u0")!;
    expect(t1.other?.name).toBeTruthy();
    expect(t1.unreadCount).toBe(2);

    const t6u5 = result.current.threads.summaries.find((s) => s.thread.id === "t-q6-u5")!;
    expect(t6u5.unreadCount).toBe(1); // no threadReadAt entry at all for u0 on this thread
    expect(t6u5.lastMessage?.body).toBeTruthy();
  });
});

describe("useThread", () => {
  function useHarness(threadId: string) {
    return { auth: useAuthSession(), thread: useThread(threadId) };
  }

  it("resolves a single thread's quest/messages/role/addressVisible", async () => {
    const result = await signIn(() => useHarness("t-q1-u0"), (r) => r.thread.isLoading);
    expect(result.current.thread.quest?.id).toBe("q1");
    expect(result.current.thread.messages.map((m) => m.id)).toEqual(["m1", "m2", "m3", "m4"]);
    expect(result.current.thread.role).toBe("doer");
    expect(result.current.thread.addressVisible).toBe(true);
    expect(result.current.thread.closed).toBe(false);
    // Counterpart resolution (usePosters) is a separate round of queries
    // fired after the thread/quest data it depends on — same "arrives a
    // beat later" shape useMyQuests.test.tsx's own doer-counterpart test
    // already documents.
    await waitFor(() => expect(result.current.thread.other?.name).toBeTruthy(), { timeout: 3000 });
  });

  it("marks a closed quest's thread as read-only", async () => {
    // t-q8-u0's quest (q8) is seeded "paid".
    const result = await signIn(() => useHarness("t-q8-u0"), (r) => r.thread.isLoading);
    expect(result.current.thread.closed).toBe(true);
  });

  it("visiting a thread marks it read, reflected in useThreads' own unread count", async () => {
    // t-q6-u5 starts at 1 unread (no prior threadReadAt entry at all for
    // u0 on this thread) — a real before/after, not a trivially-already-0 one.
    function useCombined() {
      return { auth: useAuthSession(), threads: useThreads(), thread: useThread("t-q6-u5") };
    }
    const result = await signIn(useCombined, (r) => r.threads.isLoading || r.thread.isLoading);
    await waitFor(
      () => expect(result.current.threads.summaries.find((s) => s.thread.id === "t-q6-u5")?.unreadCount).toBe(0),
      { timeout: 3000 }
    );
  });
});

describe("useSendMessage", () => {
  function useHarness(threadId: string) {
    return { auth: useAuthSession(), thread: useThread(threadId), send: useSendMessage(threadId) };
  }

  it("sends a real message, reflected in useThread's messages once invalidated", async () => {
    const result = await signIn(() => useHarness("t-q6-u2"), (r) => r.thread.isLoading);
    await act(async () => {
      await result.current.send.mutateAsync("On my way now.");
    });
    await waitFor(() => expect(result.current.thread.messages.some((m) => m.body === "On my way now.")).toBe(true), {
      timeout: 3000,
    });
  });

  it("rejects sending on a closed quest's thread", async () => {
    const result = await signIn(() => useHarness("t-q8-u0"), (r) => r.thread.isLoading);
    await act(async () => {
      await expect(result.current.send.mutateAsync("Thanks!")).rejects.toThrow(/read-only/);
    });
  });
});
