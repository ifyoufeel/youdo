import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useOfferInbox } from "../useOfferInbox";
import { useAcceptOffer } from "../useAcceptOffer";
import { useDeclineOffer } from "../useDeclineOffer";

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

function useHarness(questId: string) {
  const auth = useAuthSession();
  const inbox = useOfferInbox(questId);
  const accept = useAcceptOffer(questId);
  const decline = useDeclineOffer(questId);
  return { auth, inbox, accept, decline };
}

async function renderSignedIn(questId: string) {
  const { result } = await renderHook(() => useHarness(questId), { wrapper: makeWrapper() });
  await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
  await act(() => result.current.auth.signInWithGoogle());
  await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));
  await waitFor(() => expect(result.current.inbox.isLoading).toBe(false), { timeout: 3000 });
  return result;
}

describe("useOfferInbox", () => {
  it("splits q6's offers into pending and decided, resolving each doer", async () => {
    const result = await renderSignedIn("q6");
    expect(result.current.inbox.pending.map((o) => o.id).sort()).toEqual(["o10", "o11", "o12"]);
    expect(result.current.inbox.decided).toEqual([]);
    await waitFor(() => expect(result.current.inbox.doers.get("u5")?.name).toBeTruthy(), { timeout: 3000 });
  });
});

describe("useAcceptOffer", () => {
  it("accepts a pending offer and auto-declines the rest, reflected once invalidated", async () => {
    const result = await renderSignedIn("q6");
    await act(async () => {
      await result.current.accept.mutateAsync("o10");
    });
    await waitFor(() => expect(result.current.inbox.pending).toHaveLength(0), { timeout: 3000 });
    expect(result.current.inbox.decided.map((o) => o.id).sort()).toEqual(["o10", "o11", "o12"]);
    expect(result.current.inbox.decided.find((o) => o.id === "o10")?.status).toBe("accepted");
  });
});

describe("useDeclineOffer", () => {
  it("declines a single pending offer, reflected once invalidated", async () => {
    const result = await renderSignedIn("q3");
    const before = result.current.inbox.pending.length;
    await act(async () => {
      await result.current.decline.mutateAsync("o3");
    });
    await waitFor(() => expect(result.current.inbox.pending).toHaveLength(before - 1), { timeout: 3000 });
    expect(result.current.inbox.decided.find((o) => o.id === "o3")?.status).toBe("declined");
  });

  it("rejects declining an offer that isn't pending", async () => {
    const result = await renderSignedIn("q1");
    await act(async () => {
      await expect(result.current.decline.mutateAsync("o1")).rejects.toThrow(/can't be declined/);
    });
  });
});
