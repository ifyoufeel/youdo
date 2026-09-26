/* Ports preview/app.js:793-834's app.sendOffer/app.withdrawOffer guards
   verbatim. acceptOffer/declineOffer stay NotImplementedYet("M4") — the
   only UI that calls them (the poster's offer inbox, with accept/decline)
   is M4 work; QuestDetailScreen (M2) only ever shows a poster the pending
   *count*, never a list to act on. */
import type { OffersPort } from "../../ports/offers";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { isFirstUse } from "./idempotency";
import { NotImplementedYet } from "./not-implemented";
import { offers, threads, quests } from "./store";
import { myOfferOn } from "../../domain/lifecycle";

/* Dependency-free, same reasoning as src/lib/idempotency.ts's own
   newIdempotencyKey: crypto.randomUUID isn't guaranteed across every
   environment this adapter runs in (Hermes/web/jsdom). */
function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** One thread per (quest, doer) pair (PRD §7.5) — find the existing one
    or create it. A second offer from a *different* doer on the same
    quest must never reuse the first doer's thread. */
function findOrCreateThread(questId: string, posterId: string, doerId: string, now: string) {
  const existing = threads.find((t) => t.questId === questId && t.doerId === doerId);
  if (existing) return existing;
  const thread = { id: nextId("t"), questId, posterId, doerId, lastMessageAt: now };
  threads.push(thread);
  return thread;
}

export function createMemoryOffersPort(): OffersPort {
  return {
    async listOffersForQuest(questId) {
      await simulateLatency();
      maybeInjectFault("listOffersForQuest");
      return offers.filter((o) => o.questId === questId);
    },

    async myOfferOnQuest(questId, doerId) {
      await simulateLatency();
      maybeInjectFault("myOfferOnQuest");
      return myOfferOn(offers, questId, doerId);
    },

    async sendOffer(questId, doerId, amountMinor, note, idempotency) {
      await simulateLatency();
      maybeInjectFault("sendOffer");

      const quest = quests.find((q) => q.id === questId);
      if (!quest) {
        throw new Error("sendOffer: no such quest");
      }
      if (quest.posterId === doerId) {
        throw new Error("This is your own quest — you can't offer on it");
      }
      if (quest.status !== "open") {
        throw new Error("This quest isn't taking offers any more");
      }
      if (amountMinor <= 0) {
        throw new Error("Name a price above zero");
      }

      // Checked before "already has an offer" — a replay of the same
      // idempotencyKey would otherwise always find the offer the first
      // attempt already created and be rejected by that guard, defeating
      // idempotency entirely.
      if (!isFirstUse("sendOffer", idempotency.idempotencyKey)) {
        const existing = myOfferOn(offers, questId, doerId);
        if (existing) return existing;
      }

      if (myOfferOn(offers, questId, doerId)) {
        throw new Error("You already have an offer on this quest");
      }

      const now = new Date().toISOString();
      const offer = {
        id: nextId("o"),
        questId,
        doerId,
        amountMinor,
        status: "pending" as const,
        note,
        createdAt: now,
        respondedAt: null,
      };
      offers.push(offer);
      findOrCreateThread(questId, quest.posterId, doerId, now);
      return offer;
    },

    async withdrawOffer(offerId, idempotency) {
      await simulateLatency();
      maybeInjectFault("withdrawOffer");

      const offer = offers.find((o) => o.id === offerId);
      if (!offer) {
        throw new Error("withdrawOffer: no such offer");
      }
      // Checked before the "must be pending" guard — a replay would
      // otherwise find the offer this same call already moved to
      // "withdrawn" and be rejected by that guard instead of getting its
      // idempotent result back.
      if (!isFirstUse("withdrawOffer", idempotency.idempotencyKey)) {
        return offer;
      }
      if (offer.status !== "pending") {
        throw new Error("That offer can't be withdrawn");
      }
      offer.status = "withdrawn";
      offer.respondedAt = new Date().toISOString();
      return offer;
    },

    async declineOffer() {
      throw new NotImplementedYet("declineOffer", "M4");
    },
    async acceptOffer() {
      throw new NotImplementedYet("acceptOffer", "M4");
    },
  };
}
