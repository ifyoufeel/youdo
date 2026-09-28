/* The one place every ledger write goes through — escrow.ts (Phase 3),
   ledger.ts's settlement, and the Phase 4 sweep all call this rather than
   pushing onto `ledger` directly, so the zero-sum assertion (domain/
   ledger.ts's stampTxn) can never be bypassed. */
import type { LedgerEntry } from "../../contracts";
import { ledger } from "./store";
import { stampTxn, type LedgerEntryDraft } from "../../domain/ledger";
import { nowIso } from "./clock";

export function postTxn(txnId: string, drafts: LedgerEntryDraft[]): LedgerEntry[] {
  const entries = stampTxn(txnId, nowIso(), drafts);
  ledger.push(...entries);
  return entries;
}
