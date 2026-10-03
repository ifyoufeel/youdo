/* Shared by offers.ts (hold), quests.ts (release/refund), and the Phase 4
   clock sweep (auto-release) — every escrow movement in the app goes
   through exactly these three functions, so the ledger-invariant check
   below (money that was never held is never released or refunded) can
   never be bypassed by a call site forgetting it. */
import type { Quest, Offer } from "../../contracts";
import { ledger } from "./store";
import { heldForQuest, holdEntries, releaseEntries, refundEntries } from "../../domain/ledger";
import { postTxn } from "./post-txn";
import { nextId } from "./next-id";

export function holdEscrow(quest: Quest, offer: Offer): void {
  postTxn(nextId("tx-hold"), holdEntries(quest.posterId, quest.id, offer.amountMinor));
}

function assertFullyHeld(quest: Quest, offer: Offer): void {
  const held = heldForQuest(ledger, quest.posterId, quest.id);
  if (held !== offer.amountMinor) {
    throw new Error(
      `Ledger invariant: "${quest.id}" has ${held} minor units held for ${quest.posterId}, expected ${offer.amountMinor}`
    );
  }
}

/** `txnPrefix` distinguishes a poster-initiated confirm ("tx-release")
    from the clock sweep's auto-release ("tx-auto", Phase 4) — otherwise
    byte-identical entries. */
export function releaseEscrow(
  quest: Quest,
  offer: Offer,
  txnPrefix: "tx-release" | "tx-auto"
): { fee: number; net: number } {
  assertFullyHeld(quest, offer);
  const { drafts, fee, net } = releaseEntries(quest.posterId, offer.doerId, quest.id, offer.amountMinor);
  postTxn(nextId(txnPrefix), drafts);
  return { fee, net };
}

export function refundEscrow(quest: Quest, offer: Offer): void {
  assertFullyHeld(quest, offer);
  postTxn(nextId("tx-refund"), refundEntries(quest.posterId, quest.id, offer.amountMinor));
}
