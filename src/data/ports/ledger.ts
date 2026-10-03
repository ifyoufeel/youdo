import type { LedgerEntry, LedgerAccount, Payment } from "../contracts";
import type { Idempotent } from "./common";

/** Deliberately narrow. ADR-005's escrow hold/release/refund/fee are
    always side effects of a specific QuestsPort/OffersPort transition
    (accepting an offer holds funds, confirming releases them, cancelling
    refunds them) — never called directly. A general "postTransaction"
    method on this port would let any caller write arbitrary ledger
    entries, bypassing every lifecycle guard those other ports enforce.
    Only the two directions a person actually initiates on their own —
    adding money, cashing out — get their own methods here, and only
    those two ever pass through `pending` (ADR-005/ADR-013): they're the
    only transactions crossing the external_bank boundary a real payment
    provider would sit behind. Hold/release/refund are ledger-internal —
    they settle atomically with the lifecycle transition causing them, no
    Payment record, same as balanceOf never exposes a stored field. */
export interface LedgerPort {
  listEntriesForUser(userId: string): Promise<LedgerEntry[]>;
  /** Always derived by summation (ADR-005) — never a stored field, even
      in a return value here. */
  balanceOf(userId: string, account: LedgerAccount): Promise<number>;
  /** Newest first. Includes payments still `pending` — the wallet uses
      this to show money in flight. */
  listPaymentsForUser(userId: string): Promise<Payment[]>;

  /** Returns immediately with the Payment in state "pending" — it
      settles asynchronously (ADR-005's "a mock that resolves
      synchronously would model a world that doesn't exist"), flipping to
      "succeeded" (writing the real ledger entries) or "failed" (writing
      nothing) once payment-settlement.ts's jittered timer fires. */
  deposit(userId: string, amountMinor: number, idempotency: Idempotent): Promise<Payment>;
  cashOut(userId: string, amountMinor: number, idempotency: Idempotent): Promise<Payment>;
}
