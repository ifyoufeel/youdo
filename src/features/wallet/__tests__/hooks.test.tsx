import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { flushSettlementsForTests } from "@data/adapters/memory/payment-settlement";
import { useWallet } from "../useWallet";
import { useDeposit } from "../useDeposit";
import { useCashOut } from "../useCashOut";

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
  const wallet = useWallet();
  const deposit = useDeposit();
  const cashOut = useCashOut();
  return { auth, wallet, deposit, cashOut };
}

// useWallet's payments query polls (refetchInterval) while anything is
// pending, by design (ADR-005/ADR-013 — real time passing, not a mocked
// instant settle). That live timer keeps Jest's process alive unless the
// tree is unmounted, unlike every other hook test in this codebase — so,
// uniquely here, each render is unmounted in afterEach.
let currentUnmount: (() => void) | null = null;

afterEach(() => {
  currentUnmount?.();
  currentUnmount = null;
});

async function renderSignedIn() {
  const { result, unmount } = await renderHook(() => useHarness(), { wrapper: makeWrapper() });
  currentUnmount = unmount;
  await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
  await act(() => result.current.auth.signInWithGoogle());
  await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));
  await waitFor(() => expect(result.current.wallet.isLoading).toBe(false), { timeout: 3000 });
  return result;
}

describe("useWallet", () => {
  it("derives the real seeded numbers for u0 (meId)", async () => {
    const result = await renderSignedIn();
    // Verified directly against seed.ledger via domain/ledger.ts's own
    // balanceOf/spendableOf, not hand-computed — see this milestone's
    // adapter tests for the same numbers one layer down.
    expect(result.current.wallet.available).toBe(535500);
    expect(result.current.wallet.held).toBe(30000);
    expect(result.current.wallet.spendable).toBe(535500);
    // Doer engagements still active (not closed): q1 (in_progress, net
    // 36000) + q11 (assigned, net 13500) — q8/q9 are already "done".
    expect(result.current.wallet.incoming).toBe(49500);
  });

  it("classifies u0's real seeded history, newest first", async () => {
    const result = await renderSignedIn();
    expect(result.current.wallet.history.map((r) => r.txnId)).toEqual(["tx-q7-hold", "tx-q8-release", "tx-cash-1", "tx-open"]);
    expect(result.current.wallet.history.find((r) => r.txnId === "tx-q7-hold")?.kind).toBe("held");
    expect(result.current.wallet.history.find((r) => r.txnId === "tx-q8-release")?.kind).toBe("paid_in");
  });

  it("starts with no in-flight payments", async () => {
    const result = await renderSignedIn();
    expect(result.current.wallet.pendingPayments).toEqual([]);
    expect(result.current.wallet.failedPayments).toEqual([]);
  });
});

describe("useDeposit", () => {
  afterEach(() => {
    flushSettlementsForTests();
  });

  it("returns a pending Payment immediately, then settles to update the balance", async () => {
    const result = await renderSignedIn();
    const availableBefore = result.current.wallet.available;

    let payment: Awaited<ReturnType<typeof result.current.deposit.mutateAsync>> | undefined;
    await act(async () => {
      payment = await result.current.deposit.mutateAsync(20000);
    });
    expect(payment?.state).toBe("pending");
    expect(payment?.kind).toBe("deposit");
    expect(payment?.amountMinor).toBe(20000);

    // Not settled yet — the balance hasn't moved, but the payment shows as
    // pending in the wallet's own read.
    expect(result.current.wallet.available).toBe(availableBefore);
    await waitFor(() => expect(result.current.wallet.pendingPayments).toHaveLength(1), { timeout: 3000 });

    await act(async () => {
      flushSettlementsForTests();
    });
    await waitFor(() => expect(result.current.wallet.available).toBe(availableBefore + 20000), { timeout: 3000 });
    expect(result.current.wallet.pendingPayments).toEqual([]);
  });
});

describe("useCashOut", () => {
  afterEach(() => {
    flushSettlementsForTests();
  });

  it("rejects an amount over spendable, writing nothing", async () => {
    const result = await renderSignedIn();
    const availableBefore = result.current.wallet.available;
    await act(async () => {
      await expect(result.current.cashOut.mutateAsync(availableBefore + 100000)).rejects.toThrow();
    });
    expect(result.current.wallet.available).toBe(availableBefore);
  });

  it("settles to reduce the balance once flushed", async () => {
    const result = await renderSignedIn();
    const availableBefore = result.current.wallet.available;

    await act(async () => {
      await result.current.cashOut.mutateAsync(10000);
    });
    await act(async () => {
      flushSettlementsForTests();
    });
    await waitFor(() => expect(result.current.wallet.available).toBe(availableBefore - 10000), { timeout: 3000 });
  });
});
