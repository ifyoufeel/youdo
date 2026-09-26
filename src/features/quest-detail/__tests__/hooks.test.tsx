import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useQuestDetail } from "../useQuestDetail";
import { useSendOffer } from "../useSendOffer";
import { useWithdrawOffer } from "../useWithdrawOffer";

// Every test that actually creates an offer uses a distinct (quest, doer)
// pair, global across this file — same reasoning as
// src/data/adapters/memory/__tests__/offers.test.ts: offers/threads are
// module-level state that persists across tests within one jest file.
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
  const detail = useQuestDetail(questId);
  const send = useSendOffer();
  const withdraw = useWithdrawOffer(questId);
  return { auth, detail, send, withdraw };
}

async function renderSignedIn(questId: string) {
  const { result } = await renderHook(() => useHarness(questId), { wrapper: makeWrapper() });
  await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
  await act(() => result.current.auth.signInWithGoogle());
  await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));
  await waitFor(() => expect(result.current.detail.isLoading).toBe(false), { timeout: 3000 });
  return result;
}

describe("useQuestDetail", () => {
  it("derives 'visitor' role for an open quest with no existing offer", async () => {
    const result = await renderSignedIn("q2");
    expect(result.current.detail.role).toBe("visitor");
    expect(result.current.detail.myOffer).toBeNull();
    expect(result.current.detail.quest?.id).toBe("q2");
    expect(result.current.detail.poster?.name).toBeTruthy();
  });

  it("derives 'applicant' role and exposes myOffer for a quest already offered on", async () => {
    const result = await renderSignedIn("q3");
    expect(result.current.detail.role).toBe("applicant");
    expect(result.current.detail.myOffer?.id).toBe("o3");
  });

  it("derives 'poster' role and lists every offer for the signed-in user's own quest", async () => {
    const result = await renderSignedIn("q6");
    expect(result.current.detail.role).toBe("poster");
    expect(result.current.detail.offers.filter((o) => o.status === "pending")).toHaveLength(3);
  });

  it("derives 'doer' role and reveals the address once the accepted quest has left open", async () => {
    const result = await renderSignedIn("q1");
    expect(result.current.detail.role).toBe("doer");
    expect(result.current.detail.addressVisible).toBe(true);
  });

  it("hides the address for a visitor uninvolved in the quest", async () => {
    const result = await renderSignedIn("q4");
    expect(result.current.detail.role).toBe("visitor");
    expect(result.current.detail.addressVisible).toBe(false);
  });
});

describe("useSendOffer", () => {
  it("sends a real offer and useQuestDetail reflects it once invalidated", async () => {
    const result = await renderSignedIn("q4");
    await act(async () => {
      await result.current.send.mutateAsync({ questId: "q4", doerId: "u0", amountMinor: 55000, note: "" });
    });
    await waitFor(() => expect(result.current.detail.myOffer?.amountMinor).toBe(55000), { timeout: 3000 });
  });

  it("surfaces a guard rejection (own quest) as the mutation's error", async () => {
    const result = await renderSignedIn("q5");
    await act(async () => {
      await expect(
        result.current.send.mutateAsync({ questId: "q5", doerId: "u5", amountMinor: 30000, note: "" })
      ).rejects.toThrow(/your own quest/);
    });
  });
});

describe("useWithdrawOffer", () => {
  it("withdraws the signed-in user's own pending offer", async () => {
    const result = await renderSignedIn("q4");
    await act(async () => {
      await result.current.send.mutateAsync({ questId: "q4", doerId: "u1", amountMinor: 60000, note: "" });
    });
    await waitFor(() => expect(result.current.detail.offers.some((o) => o.doerId === "u1")).toBe(true), {
      timeout: 3000,
    });
    const offerId = result.current.detail.offers.find((o) => o.doerId === "u1")!.id;

    await act(async () => {
      await result.current.withdraw.mutateAsync(offerId);
    });
    await waitFor(
      () => expect(result.current.detail.offers.find((o) => o.id === offerId)?.status).toBe("withdrawn"),
      { timeout: 3000 }
    );
  });
});
