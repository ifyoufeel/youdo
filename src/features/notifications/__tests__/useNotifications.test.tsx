import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useNotifications, useUnreadNotificationCount } from "../useNotifications";

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

// This block runs first, and deliberately never mounts useNotifications
// (whose own mount effect fires markAllRead) — it's the one place that can
// still see u0's 4 seeded-unread notifications (n1-n4) before any other
// test in this file marks them all read.
describe("useUnreadNotificationCount", () => {
  function useHarness() {
    return { auth: useAuthSession(), count: useUnreadNotificationCount() };
  }

  it("reads a real positive count without itself marking anything read", async () => {
    const result = await signIn(useHarness, () => false);
    await waitFor(() => expect(result.current.count).toBe(4), { timeout: 3000 });
  });
});

describe("useNotifications", () => {
  function useHarness() {
    return { auth: useAuthSession(), notifications: useNotifications() };
  }

  it("lists u0's seeded notifications newest first", async () => {
    const result = await signIn(useHarness, (r) => r.notifications.isLoading);
    expect(result.current.notifications.notifications.map((n) => n.id)).toEqual([
      "n4",
      "n2",
      "n1",
      "n3",
      "n5",
    ]);
  });

  it("fires markAllRead on mount, clearing unreadCount", async () => {
    const result = await signIn(useHarness, (r) => r.notifications.isLoading);
    await waitFor(() => expect(result.current.notifications.unreadCount).toBe(0), { timeout: 3000 });
    expect(result.current.notifications.notifications.every((n) => n.readAt !== null)).toBe(true);
  });
});
