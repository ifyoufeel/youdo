/* Real as of M7 (scaffold — never run against a live project).
   listEntriesForUser/listPaymentsForUser/balanceOf are plain reads —
   Phase 1's ledger_entries_own/payments_own RLS policies already scope
   every query to the caller's own rows, so passing userId through is
   safe (a client can never successfully query anyone else's). deposit/
   cashOut go through RPCs (supabase/migrations/..._ledger_functions.sql)
   and schedule client-driven settlement via payment-settlement.ts — see
   that file's header comment for why. */
import type { LedgerPort } from "../../ports/ledger";
import type { LedgerEntry, Payment } from "../../contracts";
import { supabase } from "./client";
import type { LedgerEntryRow, PaymentRow } from "./database.types";
import { scheduleSettlement } from "./payment-settlement";

function toEntry(row: LedgerEntryRow): LedgerEntry {
  return {
    id: row.id,
    txnId: row.txn_id,
    account: row.account,
    userId: row.user_id,
    questId: row.quest_id,
    amountMinor: row.amount_minor,
    at: row.at,
    memo: row.memo,
  };
}

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    txnId: row.txn_id,
    kind: row.kind,
    userId: row.user_id,
    amountMinor: row.amount_minor,
    state: row.state,
    provider: row.provider,
    providerId: row.provider_id,
    createdAt: row.created_at,
    settledAt: row.settled_at,
  };
}

function scheduleRpcSettlement(paymentId: string): void {
  scheduleSettlement(paymentId, async () => {
    const { error } = await supabase().rpc("settle_payment", { p_payment_id: paymentId });
    if (error) {
      // Nothing meaningful to do with a failed settlement attempt here —
      // there's no caller left awaiting this timer's promise (deposit/
      // cashOut already returned the pending Payment). A live deployment
      // would route this to real error tracking; this scaffold just
      // avoids an unhandled rejection.
      console.error("settle_payment failed", error);
    }
  });
}

export function createSupabaseLedgerPort(): LedgerPort {
  return {
    async listEntriesForUser(userId) {
      const { data, error } = await supabase().from("ledger_entries").select("*").eq("user_id", userId);
      if (error) throw error;
      return ((data ?? []) as LedgerEntryRow[]).map(toEntry);
    },

    async balanceOf(userId, account) {
      const { data, error } = await supabase()
        .from("ledger_entries")
        .select("amount_minor")
        .eq("user_id", userId)
        .eq("account", account);
      if (error) throw error;
      return ((data ?? []) as { amount_minor: number }[]).reduce((sum, row) => sum + row.amount_minor, 0);
    },

    async listPaymentsForUser(userId) {
      const { data, error } = await supabase()
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as PaymentRow[]).map(toPayment);
    },

    async deposit(_userId, amountMinor, idempotency) {
      const { data, error } = await supabase().rpc("deposit", {
        p_amount_minor: amountMinor,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      const payment = toPayment(data as PaymentRow);
      scheduleRpcSettlement(payment.id);
      return payment;
    },

    async cashOut(_userId, amountMinor, idempotency) {
      const { data, error } = await supabase().rpc("cash_out", {
        p_amount_minor: amountMinor,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      const payment = toPayment(data as PaymentRow);
      scheduleRpcSettlement(payment.id);
      return payment;
    },
  };
}
