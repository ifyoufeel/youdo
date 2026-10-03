/* Wallet reads for the signed-in user: real ledger balance, in-flight
   payments, and classified history — plus the two derived numbers the
   prototype's ProfileScreen showed (spendable/incoming). The payments
   query polls while anything is still pending (M5's async settlement,
   ADR-005/ADR-013) so a deposit/cash-out visibly moves from pending to
   settled without a manual refetch. `incoming` mirrors preview/app.js's
   incomingFor — summed over useMyQuests's already-fetched doer
   engagements rather than a second N+1 fetch, the same reuse
   useActionableCount already does. */
import { useQuery } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { useMyQuests } from "@features/my-quests/useMyQuests";
import { balanceOf, spendableOf, walletRowsFor, classifyWalletRow, type WalletRowKind } from "@data/domain/ledger";
import { netOn } from "@data/domain/fees";
import type { Payment } from "@data/contracts";

export interface WalletHistoryRow {
  txnId: string;
  at: string;
  memo: string;
  questId: string | null;
  kind: WalletRowKind;
  amountMinor: number;
  signed: boolean;
}

export function useWallet() {
  const repository = useRepository();
  const { session } = useAuthSession();
  const userId = session?.userId;
  const myQuests = useMyQuests();

  const paymentsQuery = useQuery({
    queryKey: ["ledger", "payments", userId],
    queryFn: () => repository.listPaymentsForUser(userId as string),
    enabled: !!userId,
    refetchInterval: (query) => {
      const data = query.state.data as Payment[] | undefined;
      return data?.some((p) => p.state === "pending") ? 1000 : false;
    },
  });
  const payments = paymentsQuery.data ?? [];
  const hasPending = payments.some((p) => p.state === "pending");

  // Polled on the same cadence as payments, not just once on mount —
  // settlement happens off a timer (payment-settlement.ts's jittered
  // "webhook"), not a mutation this client controls, so nothing else
  // would invalidate this query when a deposit/cash-out actually lands.
  const entriesQuery = useQuery({
    queryKey: ["ledger", "entries", userId],
    queryFn: () => repository.listEntriesForUser(userId as string),
    enabled: !!userId,
    refetchInterval: hasPending ? 1000 : false,
  });
  const entries = entriesQuery.data ?? [];

  const available = userId ? balanceOf(entries, "user_available", userId) : 0;
  const held = userId ? balanceOf(entries, "user_held", userId) : 0;
  const spendable = userId ? spendableOf(entries, payments, userId) : 0;

  const incoming = myQuests.buckets.active
    .filter((e) => e.role === "doer")
    .reduce((sum, e) => sum + netOn(e.amountMinor), 0);

  const history: WalletHistoryRow[] = userId
    ? walletRowsFor(entries, userId).map((row) => {
        const face = classifyWalletRow(row);
        return { txnId: row.txnId, at: row.at, memo: row.memo, questId: row.questId, ...face };
      })
    : [];

  const pendingPayments = payments.filter((p) => p.state === "pending");
  const failedPayments = payments.filter((p) => p.state === "failed");

  return {
    available,
    held,
    spendable,
    incoming,
    history,
    pendingPayments,
    failedPayments,
    isLoading: entriesQuery.isLoading || paymentsQuery.isLoading || myQuests.isLoading,
    isError: entriesQuery.isError || paymentsQuery.isError,
  };
}
