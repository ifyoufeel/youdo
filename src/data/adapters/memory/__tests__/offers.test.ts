import { createMemoryOffersPort } from "../offers";
import { threads, offers as offerStore } from "../store";
import { resetIdempotencyForTests } from "../idempotency";
import { setFaultInjectionRate } from "../fault-injection";

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

  describe("declineOffer / acceptOffer — deferred to M4", () => {
    it("declineOffer throws NotImplementedYet", async () => {
      await expect(port.declineOffer("o2", key())).rejects.toThrow(/M4/);
    });

    it("acceptOffer throws NotImplementedYet", async () => {
      await expect(port.acceptOffer("o2", key())).rejects.toThrow(/M4/);
    });
  });
});
