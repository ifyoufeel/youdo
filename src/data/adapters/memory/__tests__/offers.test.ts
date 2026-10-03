import { createMemoryOffersPort } from "../offers";
import { threads, offers as offerStore, notifications, quests as questStore, ledger as ledgerStore } from "../store";
import { resetIdempotencyForTests } from "../idempotency";
import { setFaultInjectionRate } from "../fault-injection";
import { balanceOf } from "../../../domain/ledger";

// Every test that actually creates an offer uses a distinct (quest, doer)
// pair, global across this whole file — offers/threads are module-level
// state that persists across tests within one jest file (unlike
// idempotency, there's no reset hook for them), so reusing a pair would
// trip the "already have an offer" guard against an earlier test's write.
function key(): { idempotencyKey: string } {
  return { idempotencyKey: Math.random().toString(36).slice(2) };
}

describe("memory offers adapter", () => {
  const port = createMemoryOffersPort();

  afterEach(() => {
    resetIdempotencyForTests();
    setFaultInjectionRate(0);
  });

  describe("reads", () => {
    it("listOffersForQuest returns every offer on that quest", async () => {
      const list = await port.listOffersForQuest("q6");
      expect(list.map((o) => o.id).sort()).toEqual(["o10", "o11", "o12"]);
    });

    it("myOfferOnQuest finds the doer's pending/accepted offer", async () => {
      const mine = await port.myOfferOnQuest("q6", "u5");
      expect(mine?.id).toBe("o10");
    });

    it("myOfferOnQuest returns null when the doer has no offer there", async () => {
      const mine = await port.myOfferOnQuest("q9", "u1");
      expect(mine).toBeNull();
    });
  });

  describe("sendOffer", () => {
    it("creates a pending offer and a new thread bound to (quest, doer)", async () => {
      const threadCountBefore = threads.length;
      const offer = await port.sendOffer("q2", "u1", 25000, "Happy to help.", key());

      expect(offer.status).toBe("pending");
      expect(offer.questId).toBe("q2");
      expect(offer.doerId).toBe("u1");
      expect(offer.amountMinor).toBe(25000);

      expect(threads.length).toBe(threadCountBefore + 1);
      const thread = threads.find((t) => t.questId === "q2" && t.doerId === "u1");
      expect(thread).toBeTruthy();
      expect(thread?.posterId).toBe("u2");
    });

    it("a second offer from a different doer on the same quest gets its own distinct thread", async () => {
      await port.sendOffer("q4", "u1", 55000, "", key());
      const threadCountAfterFirst = threads.length;

      await port.sendOffer("q4", "u3", 58000, "", key());

      expect(threads.length).toBe(threadCountAfterFirst + 1);
      const threadU1 = threads.find((t) => t.questId === "q4" && t.doerId === "u1");
      const threadU3 = threads.find((t) => t.questId === "q4" && t.doerId === "u3");
      expect(threadU1).toBeTruthy();
      expect(threadU3).toBeTruthy();
      expect(threadU1?.id).not.toBe(threadU3?.id);
    });

    it("rejects offering on your own quest", async () => {
      await expect(port.sendOffer("q2", "u2", 25000, "", key())).rejects.toThrow(/your own quest/);
    });

    it("rejects offering on a quest that isn't open", async () => {
      await expect(port.sendOffer("q1", "u4", 40000, "", key())).rejects.toThrow(/isn't taking offers/);
    });

    it("rejects a duplicate offer from the same doer on the same quest", async () => {
      // o3 (seeded) is u0's existing pending offer on q3.
      await expect(port.sendOffer("q3", "u0", 100000, "", key())).rejects.toThrow(/already have an offer/);
    });

    it("rejects a non-positive amount", async () => {
      await expect(port.sendOffer("q5", "u1", 0, "", key())).rejects.toThrow(/above zero/);
    });

    it("replaying the same idempotency key returns the same offer, not a duplicate", async () => {
      const k = key();
      const first = await port.sendOffer("q5", "u2", 30000, "", k);
      const second = await port.sendOffer("q5", "u2", 30000, "", k);

      expect(second.id).toBe(first.id);
      expect(offerStore.filter((o) => o.questId === "q5" && o.doerId === "u2")).toHaveLength(1);
    });

    it("notifies the poster with the doer's name and the amount", async () => {
      const before = notifications.length;
      await port.sendOffer("q5", "u3", 33000, "", key());
      const created = notifications.slice(before);
      expect(created).toHaveLength(1);
      expect(created[0].type).toBe("offer_received");
      expect(created[0].userId).toBe("u5"); // q5's posterId
      expect(created[0].body).toMatch(/NT\$330/);
    });

    it("honors the fault-injection switch", async () => {
      setFaultInjectionRate(1);
      await expect(port.sendOffer("q2", "u4", 25000, "", key())).rejects.toThrow(/Injected fault/);
    });
  });

  describe("withdrawOffer", () => {
    it("withdraws a pending offer", async () => {
      const sent = await port.sendOffer("q6", "u1", 27000, "", key());
      const withdrawn = await port.withdrawOffer(sent.id, key());
      expect(withdrawn.status).toBe("withdrawn");
      expect(withdrawn.respondedAt).toBeTruthy();
    });

    it("rejects withdrawing an offer that isn't pending", async () => {
      // o1 is seeded as already "accepted".
      await expect(port.withdrawOffer("o1", key())).rejects.toThrow(/can't be withdrawn/);
    });

    it("replaying the same idempotency key returns the same (already-withdrawn) offer", async () => {
      const sent = await port.sendOffer("q6", "u4", 27000, "", key());
      const k = key();
      const first = await port.withdrawOffer(sent.id, k);
      const second = await port.withdrawOffer(sent.id, k);
      expect(second.status).toBe("withdrawn");
      expect(second.respondedAt).toBe(first.respondedAt);
    });
  });

  describe("declineOffer", () => {
    it("declines a pending offer and notifies the doer", async () => {
      const sent = await port.sendOffer("q6", "u4", 26000, "", key());
      const before = notifications.length;
      const declined = await port.declineOffer(sent.id, key());
      expect(declined.status).toBe("declined");
      expect(declined.respondedAt).toBeTruthy();
      const created = notifications.slice(before);
      expect(created).toHaveLength(1);
      expect(created[0].type).toBe("offer_declined");
      expect(created[0].userId).toBe("u4");
    });

    it("rejects declining an offer that isn't pending", async () => {
      // o1 is seeded as already "accepted".
      await expect(port.declineOffer("o1", key())).rejects.toThrow(/can't be declined/);
    });

    it("replaying the same idempotency key returns the same (already-declined) offer", async () => {
      const sent = await port.sendOffer("q6", "u6", 26000, "", key());
      const k = key();
      const first = await port.declineOffer(sent.id, k);
      const second = await port.declineOffer(sent.id, k);
      expect(second.status).toBe("declined");
      expect(second.respondedAt).toBe(first.respondedAt);
    });
  });

  describe("acceptOffer", () => {
    it("accepts a pending offer, holds real escrow, auto-declines every other pending offer, and assigns the quest", async () => {
      const before = notifications.length;
      const availableBefore = balanceOf(ledgerStore, "user_available", "u0"); // q6's poster
      const heldBefore = balanceOf(ledgerStore, "user_held", "u0");

      const accepted = await port.acceptOffer("o10", key()); // o10: q6, doerId u5, 25000

      expect(accepted.offer.status).toBe("accepted");
      expect(accepted.quest.status).toBe("assigned");
      expect(accepted.quest.acceptedOfferId).toBe("o10");

      expect(balanceOf(ledgerStore, "user_available", "u0")).toBe(availableBefore - 25000);
      expect(balanceOf(ledgerStore, "user_held", "u0")).toBe(heldBefore + 25000);
      const holdEntries = ledgerStore.filter((e) => e.questId === "q6" && e.userId === "u0");
      expect(holdEntries.reduce((s, e) => s + e.amountMinor, 0)).toBe(0);

      const o11 = offerStore.find((o) => o.id === "o11");
      const o12 = offerStore.find((o) => o.id === "o12");
      expect(o11?.status).toBe("declined");
      expect(o12?.status).toBe("declined");

      const created = notifications.slice(before);
      expect(created).toHaveLength(3); // accepted (u5) + 2 auto-declined (u3, u2)
      expect(created.filter((n) => n.type === "offer_accepted")).toHaveLength(1);
      expect(created.filter((n) => n.type === "offer_declined")).toHaveLength(2);
    });

    it("rejects accepting an offer the poster can't afford to hold, writing no ledger entries", async () => {
      const available = balanceOf(ledgerStore, "user_available", "u2"); // q2's poster
      const sent = await port.sendOffer("q2", "u9", available + 100000, "", key());
      const ledgerLengthBefore = ledgerStore.length;

      await expect(port.acceptOffer(sent.id, key())).rejects.toThrow(/more in your wallet/);

      expect(ledgerStore.length).toBe(ledgerLengthBefore);
      const stillPending = offerStore.find((o) => o.id === sent.id)!;
      expect(stillPending.status).toBe("pending");
      expect(questStore.find((q) => q.id === "q2")!.status).toBe("open");
    });

    it("rejects accepting an offer once the quest is no longer open", async () => {
      // Whitebox: force the quest's own status directly (there's no other
      // way to reach "a still-pending offer on a non-open quest" through
      // the port alone — acceptOffer's own success always declines every
      // other pending offer on the same quest in the same call).
      const sent = await port.sendOffer("q4", "u6", 45000, "", key());
      const quest = questStore.find((q) => q.id === "q4")!;
      const originalStatus = quest.status;
      quest.status = "assigned";
      await expect(port.acceptOffer(sent.id, key())).rejects.toThrow(/isn't taking offers/);
      quest.status = originalStatus;
    });

    it("rejects accepting an offer that isn't pending", async () => {
      // Whitebox: force the offer itself out of "pending" while leaving
      // its quest "open" — the only way to isolate this guard from the
      // "quest isn't open" one above, since every non-pending offer in
      // the seed fixture belongs to an already-non-open quest.
      const sent = await port.sendOffer("q5", "u9", 36000, "", key());
      const offer = offerStore.find((o) => o.id === sent.id)!;
      offer.status = "withdrawn";
      await expect(port.acceptOffer(sent.id, key())).rejects.toThrow(/can't be accepted/);
    });

    it("replaying the same idempotency key returns the identical result, without re-declining anyone a second time", async () => {
      const sent1 = await port.sendOffer("q3", "u7", 100000, "", key());
      const sent2 = await port.sendOffer("q3", "u8", 101000, "", key());
      const k = key();
      const first = await port.acceptOffer(sent1.id, k);
      const secondNotificationCount = notifications.length;
      const second = await port.acceptOffer(sent1.id, k);

      expect(second.offer.id).toBe(first.offer.id);
      expect(second.quest.status).toBe("assigned");
      expect(second.quest.acceptedOfferId).toBe(sent1.id);
      expect(offerStore.find((o) => o.id === sent2.id)?.status).toBe("declined");
      expect(notifications.length).toBe(secondNotificationCount); // no duplicate notifications on replay
    });
  });
});
