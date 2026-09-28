import { createMemoryQuestsPort } from "../quests";
import { quests as questStore, notifications, ledger as ledgerStore } from "../store";
import { resetIdempotencyForTests } from "../idempotency";
import { setFaultInjectionRate } from "../fault-injection";
import { postTxn } from "../post-txn";
import { holdEntries } from "../../../domain/ledger";
import { nextId } from "../next-id";
import type { PostQuestInput } from "../../../ports/quests";
import type { QuestStatus } from "../../../contracts";

/** Whitebox — this file only imports QuestsPort, not OffersPort, so it
    can't reach "assigned" through a live acceptOffer call (q11 is the
    fixture's one real "assigned" record, but exercising every guard
    combination still needs more states than one fixture quest can give).
    Tests that need a specific (status, acceptedOfferId) pair force it
    directly on the store's mutable Quest object and restore it after. */
function forceQuestState(id: string, status: QuestStatus, acceptedOfferId: string | null) {
  const quest = questStore.find((q) => q.id === id)!;
  const snapshot = { status: quest.status, acceptedOfferId: quest.acceptedOfferId };
  quest.status = status;
  quest.acceptedOfferId = acceptedOfferId;
  return () => {
    quest.status = snapshot.status;
    quest.acceptedOfferId = snapshot.acceptedOfferId;
  };
}

/** Whitebox pair to forceQuestState — cancelQuest/confirmDone (M5) assert
    real escrow is held before refunding/releasing it, so a forced
    assigned/in_progress state also needs a matching ledger hold or that
    invariant check throws. postTxn only ever appends, so restoring to the
    pre-call length undoes it cleanly. */
function forceHold(questId: string, posterId: string, amountMinor: number) {
  const before = ledgerStore.length;
  postTxn(nextId("tx-test-hold"), holdEntries(posterId, questId, amountMinor));
  return () => {
    ledgerStore.length = before;
  };
}

// Every test that actually posts a quest gets its own idempotency key —
// quests is module-level state that persists across tests within one
// jest file, same reasoning offers.test.ts's own key() gives.
function key(): { idempotencyKey: string } {
  return { idempotencyKey: Math.random().toString(36).slice(2) };
}

const BASE_INPUT: PostQuestInput = {
  posterId: "u0",
  title: "Assemble a bookshelf",
  details: "Flat-pack, instructions included.",
  categoryId: "assembly",
  payoutMinor: 60000,
  estimatedMinutes: 90,
  durationLabel: null,
  addressLine: "14B, Lane 31, Yongkang St",
  area: "Da'an",
  point: { x: 1920, y: -2260 },
  scheduledFor: "2026-09-20T14:00:00+08:00",
  expiresAt: "2026-09-20T13:00:00+08:00",
  requirements: [],
};

describe("memory quests adapter", () => {
  const port = createMemoryQuestsPort();

  afterEach(() => {
    resetIdempotencyForTests();
    setFaultInjectionRate(0);
  });

  describe("postQuest", () => {
    it("creates a real open quest with the given shape", async () => {
      const quest = await port.postQuest(BASE_INPUT, key());
      expect(quest.status).toBe("open");
      expect(quest.payoutUnit).toBe("fixed");
      expect(quest.acceptedOfferId).toBeNull();
      expect(quest.title).toBe("Assemble a bookshelf");
      expect(quest.requirements).toEqual([]);
      expect(quest.createdAt).toBeTruthy();
      expect(quest.id).toBeTruthy();
    });

    it("appears in listQuests immediately", async () => {
      const posted = await port.postQuest(BASE_INPUT, key());
      const page = await port.listQuests({ center: BASE_INPUT.point, radiusM: 1_000_000, limit: 200 });
      expect(page.items.some((q) => q.id === posted.id)).toBe(true);
    });

    it("preserves an open-ended durationLabel", async () => {
      const quest = await port.postQuest({ ...BASE_INPUT, estimatedMinutes: 360, durationLabel: "6+ hr" }, key());
      expect(quest.durationLabel).toBe("6+ hr");
    });

    it("replaying the same idempotency key returns the identical quest, not a duplicate", async () => {
      const k = key();
      const first = await port.postQuest(BASE_INPUT, k);
      const second = await port.postQuest(BASE_INPUT, k);
      expect(second.id).toBe(first.id);
      expect(questStore.filter((q) => q.id === first.id)).toHaveLength(1);
    });

    it("honors the fault-injection switch", async () => {
      setFaultInjectionRate(1);
      await expect(port.postQuest(BASE_INPUT, key())).rejects.toThrow(/Injected fault/);
    });
  });

  describe("listMyQuests", () => {
    it("returns quests posted by the user, offered on by the user, and doing for the user — never a pure visitor's", async () => {
      const mine = await port.listMyQuests("u0");
      // Scoped to the original fixture ids (q1..q10) — other tests in this
      // file post quests as u0 too, and those are correctly included by
      // listMyQuests, but aren't this test's concern.
      const ids = mine.map((q) => q.id).filter((id) => /^q\d+$/.test(id));
      // q1: u0's accepted offer (doer) · q3: u0's pending offer (applicant)
      // q6/q7: posted by u0 · q8/q9: u0's accepted offer, now closed
      // q11: u0's accepted offer (doer), assigned
      expect(ids.sort()).toEqual(["q1", "q11", "q3", "q6", "q7", "q8", "q9"]);
      // q2/q4/q5/q10: u0 has no relationship to any of these.
      expect(ids).not.toContain("q2");
      expect(ids).not.toContain("q4");
      expect(ids).not.toContain("q5");
      expect(ids).not.toContain("q10");
    });

    it("includes a quest the same session just posted", async () => {
      const posted = await port.postQuest(BASE_INPUT, key());
      const mine = await port.listMyQuests("u0");
      expect(mine.some((q) => q.id === posted.id)).toBe(true);
    });

    it("returns an empty list for a user with no engagement", async () => {
      const mine = await port.listMyQuests("u-nobody");
      expect(mine).toEqual([]);
    });
  });

  describe("startQuest", () => {
    it("rejects a non-doer actor", async () => {
      const restore = forceQuestState("q2", "assigned", "o2"); // o2: q2, doerId u3
      await expect(port.startQuest("q2", "u2", key())).rejects.toThrow(/can't move this/); // u2 is q2's poster
      restore();
    });

    it("moves an assigned quest to in_progress for the accepted doer, and notifies the poster", async () => {
      const restore = forceQuestState("q2", "assigned", "o2");
      const before = notifications.length;
      const result = await port.startQuest("q2", "u3", key());
      expect(result.status).toBe("in_progress");
      expect(result.startedAt).toBeTruthy();
      const created = notifications.slice(before);
      expect(created).toHaveLength(1);
      expect(created[0].type).toBe("quest_started");
      expect(created[0].userId).toBe("u2"); // q2's posterId
      restore();
    });

    it("replaying the same idempotency key returns the identical (already in_progress) quest", async () => {
      const restore = forceQuestState("q2", "assigned", "o2");
      const k = key();
      const first = await port.startQuest("q2", "u3", k);
      const second = await port.startQuest("q2", "u3", k);
      expect(second.startedAt).toBe(first.startedAt);
      restore();
    });
  });

  describe("markDone", () => {
    it("moves an in_progress quest to completed for its doer, and notifies the poster", async () => {
      // q1 is naturally in_progress with o1 (doerId u0) accepted — no
      // whitebox forcing needed, unlike startQuest's assigned-state gap.
      const before = notifications.length;
      const result = await port.markDone("q1", "u0", key());
      expect(result.status).toBe("completed");
      expect(result.completedAt).toBeTruthy();
      const created = notifications.slice(before);
      expect(created).toHaveLength(1);
      expect(created[0].type).toBe("quest_done");
      expect(created[0].userId).toBe("u1"); // q1's posterId
    });

    it("rejects a non-doer actor", async () => {
      const restore = forceQuestState("q4", "in_progress", "o5"); // o5: q4, doerId u2
      await expect(port.markDone("q4", "u4", key())).rejects.toThrow(/can't move this/); // u4 is neither poster nor the accepted doer
      restore();
    });

    it("replaying the same idempotency key returns the identical (already completed) quest", async () => {
      const restore = forceQuestState("q4", "in_progress", "o5");
      const k = key();
      const first = await port.markDone("q4", "u2", k);
      const second = await port.markDone("q4", "u2", k);
      expect(second.completedAt).toBe(first.completedAt);
      restore();
    });
  });

  describe("confirmDone", () => {
    it("releases the held escrow to the doer minus the fee, notifies the doer, and is idempotent on replay", async () => {
      // q7 is naturally completed with a real accepted offer (o7, u5,
      // 30000) and a real held escrow in the seed — no whitebox forcing
      // needed, unlike the other describe blocks' assigned/in_progress gaps.
      const before = notifications.length;
      const k = key();
      const first = await port.confirmDone("q7", "u0", k);
      expect(first.status).toBe("paid");
      expect(first.paidAt).toBeTruthy();

      const created = notifications.slice(before);
      expect(created).toHaveLength(1);
      expect(created[0].type).toBe("payment");
      expect(created[0].userId).toBe("u5"); // q7's accepted doer
      expect(created[0].body).toMatch(/NT\$270/); // net = 30000 - floor(30000*10%) fee, minor->display /100

      const second = await port.confirmDone("q7", "u0", k);
      expect(second.paidAt).toBe(first.paidAt);
      expect(notifications.length).toBe(before + 1); // no duplicate notification on replay
    });

    it("rejects a non-poster actor", async () => {
      const restore = forceQuestState("q2", "completed", "o2"); // o2: q2, doerId u3, amountMinor 20000
      const restoreHold = forceHold("q2", "u2", 20000);
      await expect(port.confirmDone("q2", "u3", key())).rejects.toThrow(/can't move this/); // u3 is the doer, not poster
      restoreHold();
      restore();
    });

    it("rejects a quest with no accepted offer", async () => {
      const restore = forceQuestState("q2", "completed", null);
      await expect(port.confirmDone("q2", "u2", key())).rejects.toThrow(/no accepted offer/);
      restore();
    });
  });

  describe("cancelQuest", () => {
    it("cancels a still-open quest with no reason required, withdrawing every pending offer on it", async () => {
      const posted = await port.postQuest(BASE_INPUT, key());
      const cancelled = await port.cancelQuest(posted.id, "u0", "", key());
      expect(cancelled.status).toBe("cancelled");
      expect(cancelled.cancelledBy).toBe("u0");
      expect(cancelled.cancelReason).toBeUndefined();
    });

    it("requires a reason once an offer has been accepted, refunds the hold in full, and notifies the counterpart", async () => {
      const restore = forceQuestState("q4", "in_progress", "o5"); // o5: q4, doerId u2, posterId u4
      const restoreHold = forceHold("q4", "u4", 60000); // o5.amountMinor
      await expect(port.cancelQuest("q4", "u4", "", key())).rejects.toThrow(/Say why/);

      const before = notifications.length;
      const availableBefore = ledgerStore
        .filter((e) => e.account === "user_available" && e.userId === "u4")
        .reduce((s, e) => s + e.amountMinor, 0);
      const cancelled = await port.cancelQuest("q4", "u4", "Change of plans", key());
      expect(cancelled.status).toBe("cancelled");
      expect(cancelled.cancelReason).toBe("Change of plans");
      const availableAfter = ledgerStore
        .filter((e) => e.account === "user_available" && e.userId === "u4")
        .reduce((s, e) => s + e.amountMinor, 0);
      expect(availableAfter).toBe(availableBefore + 60000); // refunded in full, no fee
      const created = notifications.slice(before);
      expect(created).toHaveLength(1);
      expect(created[0].type).toBe("quest_cancelled");
      expect(created[0].userId).toBe("u2"); // the accepted doer, counterpart to the poster who cancelled
      expect(created[0].body).toMatch(/Change of plans/);

      restoreHold();
      restore();
    });

    it("rejects a non-participant actor", async () => {
      await expect(port.cancelQuest("q3", "u-nobody", "Not mine", key())).rejects.toThrow(/not on this quest/);
    });

    it("replaying the same idempotency key returns the identical (already cancelled) quest", async () => {
      const posted = await port.postQuest(BASE_INPUT, key());
      const k = key();
      const first = await port.cancelQuest(posted.id, "u0", "", k);
      const second = await port.cancelQuest(posted.id, "u0", "", k);
      expect(second.cancelledAt).toBe(first.cancelledAt);
    });
  });
});
