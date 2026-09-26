import type { LedgerEntry, LedgerAccount } from "../contracts";
import type { Idempotent } from "./common";

/** Deliberately narrow. ADR-005's escrow hold/release/refund/fee are
    always side effects of a specific QuestsPort/OffersPort transition
    (accepting an offer holds funds, confirming releases them, cancelling
    refunds them) — never called directly. A general "postTransaction"
    method on this port would let any caller write arbitrary ledger
    entries, bypassing every lifecycle guard those other ports enforce.
    Only the two directions a person actually initiates on their own —
    adding money, cashing out — get their own methods here. */
export interface LedgerPort {
  listEntriesForUser(userId: string): Promise<LedgerEntry[]>;
  /** Always derived by summation (ADR-005) — never a stored field, even
      in a return value here. */
  balanceOf(userId: string, account: LedgerAccount): Promise<number>;

  deposit(userId: string, amountMinor: number, idempotency: Idempotent): Promise<LedgerEntry[]>;
  cashOut(userId: string, amountMinor: number, idempotency: Idempotent): Promise<LedgerEntry[]>;
}
