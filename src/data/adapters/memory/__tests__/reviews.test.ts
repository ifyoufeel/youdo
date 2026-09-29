import { createMemoryReviewsPort } from "../reviews";
import { reviews as reviewStore } from "../store";
import { resetIdempotencyForTests } from "../idempotency";
import { setFaultInjectionRate } from "../fault-injection";

// Every test that actually submits a review gets its own idempotency key —
// reviews is module-level state that persists across tests within one
// jest file, same reasoning quests.test.ts's own key() gives.
function key(): { idempotencyKey: string } {
  return { idempotencyKey: Math.random().toString(36).slice(2) };
}

describe("memory reviews adapter", () => {
  const port = createMemoryReviewsPort();
  let seedLength: number;

  beforeEach(() => {
    seedLength = reviewStore.length;
  });

  afterEach(() => {
    // submitReview only ever pushes, so truncating back to the pre-test
    // length undoes it cleanly — same reasoning quests.test.ts's
    // forceHold gives for ledger entries. Without this, a review one test
    // creates (e.g. u0 rating u2 on q8) would make every later test on
    // that same (quest, rater) pair see "already rated" instead of what
    // it's actually trying to exercise.
    reviewStore.length = seedLength;
    resetIdempotencyForTests();
    setFaultInjectionRate(0);
  });

  describe("listReviewsForUser / myReviewOnQuest (real seed reads)", () => {
    it("lists the reviews where the given user is the ratee", async () => {
      const reviews = await port.listReviewsForUser("u0");
      expect(reviews.map((r) => r.id)).toContain("r1");
      expect(reviews.every((r) => r.rateeId === "u0")).toBe(true);
    });

    it("returns an empty list for a user nobody has rated", async () => {
      const reviews = await port.listReviewsForUser("u9");
      expect(reviews).toEqual([]);
    });

    it("finds a rater's own review on a quest", async () => {
      const review = await port.myReviewOnQuest("q8", "u2");
      expect(review?.id).toBe("r1");
      expect(review?.rateeId).toBe("u0");
    });

    it("returns null when this rater hasn't reviewed this quest yet", async () => {
      const review = await port.myReviewOnQuest("q8", "u0");
      expect(review).toBeNull();
    });
  });

  describe("submitReview", () => {
    it("lets the doer rate the poster back on a real paid quest (q8: poster u2, doer u0 via o8)", async () => {
      const review = await port.submitReview("q8", "u0", "u2", 4, "Fair and easy to reach.", key());
      expect(review.questId).toBe("q8");
      expect(review.raterId).toBe("u0");
      expect(review.rateeId).toBe("u2");
      expect(review.rating).toBe(4);
      expect(review.comment).toBe("Fair and easy to reach.");

      const mine = await port.myReviewOnQuest("q8", "u0");
      expect(mine?.id).toBe(review.id);
    });

    it("rejects a rating on a quest that isn't paid yet", async () => {
      await expect(port.submitReview("q1", "u0", "u1", 5, "", key())).rejects.toThrow();
    });

    it("rejects a rating from someone who wasn't poster or doer on the quest", async () => {
      await expect(port.submitReview("q8", "u9", "u2", 5, "", key())).rejects.toThrow();
    });

    it("rejects a second rating from the same rater on the same quest", async () => {
      // u2 already rated u0 on q8 via the seeded r1 fixture.
      await expect(port.submitReview("q8", "u2", "u0", 3, "again", key())).rejects.toThrow();
    });

    it("rejects a rateeId that doesn't match the other side of the quest", async () => {
      await expect(port.submitReview("q8", "u0", "u9", 5, "", key())).rejects.toThrow();
    });

    it("rejects a rating outside 1-5 or a non-integer rating", async () => {
      await expect(port.submitReview("q8", "u0", "u2", 0, "", key())).rejects.toThrow();
      await expect(port.submitReview("q8", "u0", "u2", 6, "", key())).rejects.toThrow();
      await expect(port.submitReview("q8", "u0", "u2", 3.5, "", key())).rejects.toThrow();
    });

    it("replays idempotently rather than creating a second review", async () => {
      const k = key();
      const first = await port.submitReview("q8", "u0", "u2", 5, "Great", k);
      const second = await port.submitReview("q8", "u0", "u2", 5, "Great", k);
      expect(second.id).toBe(first.id);

      const mine = await port.myReviewOnQuest("q8", "u0");
      expect(mine?.id).toBe(first.id);
    });
  });
});
