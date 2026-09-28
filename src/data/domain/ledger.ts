/* ADR-005's ledger arithmetic, pure — no store imports, same discipline
   as fees.ts and lifecycle.ts. Ported from preview/app.js:543-590's
   balanceOf/postTxn, with one real fix: postTxn there silently drops an
   imbalanced transaction (console.error, no throw) — here it throws,
   since a caller that builds an imbalanced draft has a real bug to find,
   not a warning to ignore.

   classifyWalletRow reads only which accounts moved, not txnId or memo
   text (the prototype's actual walletRowFace does the latter, matching
   English memo strings like /refund/i — fragile, and the seed's own
   txnIds are irregular: "tx-q8-hold", "tx-open-3". Account deltas are a
   robust discriminator for both seeded and newly-created transactions. */
import type { LedgerEntry, LedgerAccount, Payment } from "../contracts";
import { feeOn } from "./fees";

export class LedgerImbalanceError extends Error {
  constructor(txnId: string, sum: number) {
    super(`Ledger transaction "${txnId}" does not sum to zero (got ${sum})`);
    this.name = "LedgerImbalanceError";
  }
}

export type LedgerEntryDraft = Pick<LedgerEntry, "account" | "userId" | "questId" | "amountMinor" | "memo">;

/** Stamps a set of drafts into real entries sharing one txnId, after
    asserting they sum to zero (ADR-005's invariant, enforced here so it
    can never be bypassed by a caller forgetting to check). */
export function stampTxn(txnId: string, at: string, drafts: LedgerEntryDraft[]): LedgerEntry[] {
  const sum = drafts.reduce((total, d) => total + d.amountMinor, 0);
  if (sum !== 0) throw new LedgerImbalanceError(txnId, sum);
  return drafts.map((d, i) => ({ id: `${txnId}-${i + 1}`, txnId, at, ...d }));
}

export function balanceOf(ledger: readonly LedgerEntry[], account: LedgerAccount, userId: string | null): number {
  return ledger.reduce((sum, e) => (e.account === account && e.userId === userId ? sum + e.amountMinor : sum), 0);
}

/** The amount currently held in escrow for one specific quest, scoped to
    the poster — used to assert "you can't release/refund more than was
    actually held" before either mutation runs. */
export function heldForQuest(ledger: readonly LedgerEntry[], posterId: string, questId: string): number {
  return ledger.reduce(
    (sum, e) => (e.account === "user_held" && e.userId === posterId && e.questId === questId ? sum + e.amountMinor : sum),
    0
  );
}

/** Available minus any cash-out still in flight — a pending payout can't
    be spent twice (accepted into escrow, or cashed out again) before it
    settles. */
export function spendableOf(ledger: readonly LedgerEntry[], payments: readonly Payment[], userId: string): number {
  const pendingCashOut = payments.reduce(
    (sum, p) => (p.userId === userId && p.kind === "cashout" && p.state === "pending" ? sum + p.amountMinor : sum),
    0
  );
  return balanceOf(ledger, "user_available", userId) - pendingCashOut;
}

/** Entries for accepting an offer — the hold is the offer's amount, not
    the quest's asking price (preview/app.js:869-873). */
export function holdEntries(posterId: string, questId: string, amountMinor: number): LedgerEntryDraft[] {
  return [
    { account: "user_available", userId: posterId, questId, amountMinor: -amountMinor, memo: "Held for a quest" },
    { account: "user_held", userId: posterId, questId, amountMinor, memo: "Held for a quest" },
  ];
}

/** Entries for confirming (or auto-releasing) a quest — gross/fee/net
    split via fees.ts's feeOn, matching preview/app.js:933-938 exactly. */
export function releaseEntries(
  posterId: string,
  doerId: string,
  questId: string,
  gross: number
): { drafts: LedgerEntryDraft[]; fee: number; net: number } {
  const fee = feeOn(gross);
  const net = gross - fee;
  return {
    drafts: [
      { account: "user_held", userId: posterId, questId, amountMinor: -gross, memo: "Released to the doer" },
      { account: "user_available", userId: doerId, questId, amountMinor: net, memo: "Quest paid" },
      { account: "platform_fee", userId: null, questId, amountMinor: fee, memo: "Platform fee" },
    ],
    fee,
    net,
  };
}

/** Entries for a full refund on cancel — no fee, matching
    preview/app.js:957-962. */
export function refundEntries(posterId: string, questId: string, amountMinor: number): LedgerEntryDraft[] {
  return [
    { account: "user_held", userId: posterId, questId, amountMinor: -amountMinor, memo: "Refunded after cancellation" },
    { account: "user_available", userId: posterId, questId, amountMinor, memo: "Refunded after cancellation" },
  ];
}

export function depositEntries(userId: string, amountMinor: number, bank: string): LedgerEntryDraft[] {
  return [
    { account: "external_bank", userId, questId: null, amountMinor: -amountMinor, memo: `Added from ${bank}` },
    { account: "user_available", userId, questId: null, amountMinor, memo: `Added from ${bank}` },
  ];
}

export function cashOutEntries(userId: string, amountMinor: number, bank: string): LedgerEntryDraft[] {
  return [
    { account: "user_available", userId, questId: null, amountMinor: -amountMinor, memo: `Cash out to ${bank}` },
    { account: "external_bank", userId, questId: null, amountMinor, memo: `Cash out to ${bank}` },
  ];
}

export interface WalletRow {
  txnId: string;
  at: string;
  memo: string;
  questId: string | null;
  available: number;
  held: number;
  bank: number;
}

/** Groups one user's entries by txnId (preview/app.js:3277-3293's
    walletRowsFor) — memo/questId/at come from the first entry seen per
    transaction, newest first; ties (the clock can be frozen — see
    clock.ts) break by insertion order, i.e. array order is preserved
    within equal `at` values since Array.prototype.sort is stable. */
export function walletRowsFor(ledger: readonly LedgerEntry[], userId: string): WalletRow[] {
  const rows = new Map<string, WalletRow>();
  for (const e of ledger) {
    if (e.userId !== userId) continue;
    let row = rows.get(e.txnId);
    if (!row) {
      row = { txnId: e.txnId, at: e.at, memo: e.memo, questId: e.questId, available: 0, held: 0, bank: 0 };
      rows.set(e.txnId, row);
    }
    if (e.account === "user_available") row.available += e.amountMinor;
    else if (e.account === "user_held") row.held += e.amountMinor;
    else if (e.account === "external_bank") row.bank += e.amountMinor;
  }
  return [...rows.values()].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

export type WalletRowKind = "held" | "released" | "refunded" | "added" | "paid_in" | "sent" | "out";

/** Classifies a wallet row by which accounts moved, not by parsing txnId
    or matching memo text against English words (the prototype's actual
    approach) — see this file's header comment for why. */
export function classifyWalletRow(row: WalletRow): { kind: WalletRowKind; amountMinor: number; signed: boolean } {
  if (row.held > 0) return { kind: "held", amountMinor: row.available, signed: true };
  if (row.held < 0 && row.available === 0) return { kind: "released", amountMinor: -row.held, signed: false };
  if (row.held < 0 && row.available > 0) return { kind: "refunded", amountMinor: row.available, signed: true };
  if (row.available > 0 && row.bank < 0) return { kind: "added", amountMinor: row.available, signed: true };
  if (row.available > 0) return { kind: "paid_in", amountMinor: row.available, signed: true };
  if (row.available < 0 && row.bank > 0) return { kind: "sent", amountMinor: row.available, signed: true };
  return { kind: "out", amountMinor: row.available, signed: true };
}
