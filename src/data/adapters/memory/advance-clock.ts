/* The one entry point that moves the memory adapter's clock — dev-only
   plumbing (composition-root re-exports it for app/(preview)'s DevStrip),
   never called from a real user-facing screen. After moving the clock,
   applies domain/clock.ts's planSweep: expiring stale open quests (and
   their pending offers) and auto-releasing completed quests past the 72h
   confirm window, through the same escrow.ts helper confirmDone uses so
   the entries are identical apart from the txnId prefix. */
import { moveClock, nowIso, nowMs } from "./clock";
import { quests, offers } from "./store";
import { planSweep } from "../../domain/clock";
import { releaseEscrow } from "./escrow";
import { notify } from "./notify";
import { money, formatMoney } from "../../contracts";

export function advanceClock(deltaMs: number): void {
  moveClock(deltaMs);
  applySweep();
}

function applySweep(): void {
  const plan = planSweep(quests, offers, nowMs());
  const now = nowIso();

  for (const { questId, pendingOfferIds } of plan.expire) {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) continue;
    quest.status = "expired";
    for (const offerId of pendingOfferIds) {
      const offer = offers.find((o) => o.id === offerId);
      if (!offer) continue;
      offer.status = "expired";
      offer.respondedAt = now;
    }
    notify(quest.posterId, "quest_expired", quest.id, `"${quest.title}" expired — no one took it in time`);
  }

  for (const { questId, offerId } of plan.release) {
    const quest = quests.find((q) => q.id === questId);
    const offer = offers.find((o) => o.id === offerId);
    if (!quest || !offer) continue;
    const { net } = releaseEscrow(quest, offer, "tx-auto");
    quest.status = "paid";
    quest.paidAt = now;
    notify(offer.doerId, "payment", quest.id, `${formatMoney(money(net))} released automatically for "${quest.title}"`);
    notify(
      quest.posterId,
      "payment",
      quest.id,
      `The 72-hour window closed, so "${quest.title}" paid out automatically`
    );
  }
}
