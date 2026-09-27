/* Ports preview/app.js:793-834's app.sendOffer/app.withdrawOffer guards
   verbatim, plus M4's acceptOffer/declineOffer (app.js:836-888) — with
   zero ledger interaction. LedgerPort is entirely NotImplementedYet("M5")
   (see its own module comment), so acceptOffer here does the real status
   transition, auto-decline, and address reveal but never holds money —
   that's M5's job once it wires a real ledger call into this same
   mutation. Money-free, cancelQuest (quests.ts) mirrors the same
   boundary: nothing was ever held, so there's nothing to refund either. */
import type { OffersPort } from "../../ports/offers";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { isFirstUse } from "./idempotency";
import { offers, threads, quests, users } from "./store";
import { myOfferOn } from "../../domain/lifecycle";
import { nextId } from "./next-id";
import { notify } from "./notify";
import { money, formatMoney } from "../../contracts";

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

      const doer = users.get(doerId);
      notify(
        quest.posterId,
        "offer_received",
        questId,
        `${doer?.name ?? "Someone"} offered ${formatMoney(money(amountMinor))} on "${quest.title}"`
      );

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

    async declineOffer(offerId, idempotency) {
      await simulateLatency();
      maybeInjectFault("declineOffer");

      const offer = offers.find((o) => o.id === offerId);
      if (!offer) {
        throw new Error("declineOffer: no such offer");
      }
      // Same replay-before-guard order as withdrawOffer: a retry must find
      // this call's own prior result, not be rejected by the guard it
      // already satisfied.
      if (!isFirstUse("declineOffer", idempotency.idempotencyKey)) {
        return offer;
      }
      if (offer.status !== "pending") {
        throw new Error("That offer can't be declined");
      }
      offer.status = "declined";
      offer.respondedAt = new Date().toISOString();

      const quest = quests.find((q) => q.id === offer.questId);
      notify(offer.doerId, "offer_declined", offer.questId, `Your offer on "${quest?.title ?? "a quest"}" wasn't taken this time`);

      return offer;
    },

    async acceptOffer(offerId, idempotency) {
      await simulateLatency();
      maybeInjectFault("acceptOffer");

      const offer = offers.find((o) => o.id === offerId);
      if (!offer) {
        throw new Error("acceptOffer: no such offer");
      }
      const quest = quests.find((q) => q.id === offer.questId);
      if (!quest) {
        throw new Error("acceptOffer: no such quest");
      }

      // Replay via the natural post-hoc lookup — quest.acceptedOfferId is
      // already set to this offer's id once the first call succeeded, so
      // there's no need for a dedicated idempotency-key cache the way
      // postQuest/sendMessage need one.
      if (!isFirstUse("acceptOffer", idempotency.idempotencyKey)) {
        if (quest.acceptedOfferId === offer.id) return { offer, quest };
      }

      if (quest.status !== "open") {
        throw new Error("This quest isn't taking offers any more");
      }
      if (offer.status !== "pending") {
        throw new Error("That offer can't be accepted");
      }

      const now = new Date().toISOString();
      offer.status = "accepted";
      offer.respondedAt = now;
      quest.status = "assigned";
      quest.acceptedOfferId = offer.id;

      notify(offer.doerId, "offer_accepted", quest.id, `Your offer on "${quest.title}" was accepted`);

      const others = offers.filter((o) => o.questId === quest.id && o.status === "pending" && o.id !== offer.id);
      for (const other of others) {
        other.status = "declined";
        other.respondedAt = now;
        notify(other.doerId, "offer_declined", quest.id, `"${quest.title}" went to someone else`);
      }

      return { offer, quest };
    },
  };
}
