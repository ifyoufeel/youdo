import { createMemoryQuestsPort } from "../quests";
import { quests as questStore } from "../store";
import { resetIdempotencyForTests } from "../idempotency";
import { setFaultInjectionRate } from "../fault-injection";
import type { PostQuestInput } from "../../../ports/quests";

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
      expect(ids.sort()).toEqual(["q1", "q3", "q6", "q7", "q8", "q9"]);
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
});
