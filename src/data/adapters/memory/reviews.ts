/* Ports preview/app.js:1058-1074's app.submitReview guards verbatim: paid
   only, poster/doer only, one review per (quest, rater) pair. Deliberately
   does NOT recompute the ratee's User.rating/questsCompleted/cancelRate —
   those are seed-authored baselines representing history the fixture's
   single review record can't reconstruct (u0's rating is 4.8 across 27
   completed quests; the whole fixture has exactly one Review). Recomputing
   from a corpus this thin would replace a real number with a misleading
   one, not a more honest one — see docs/DECISIONS.md's ADR for the
   full reasoning. */
import type { ReviewsPort } from "../../ports/reviews";
import type { Review } from "../../contracts";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { isFirstUse } from "./idempotency";
import { reviews, offers, quests } from "./store";
import { roleOn, counterpartIdOn } from "../../domain/lifecycle";
import { myReviewOn, canRate, reviewsOf, reviewVisible } from "../../domain/reviews";
import { nextId } from "./next-id";
import { nowIso, nowMs } from "./clock";

const reviewsByKey = new Map<string, Review>();

export function createMemoryReviewsPort(): ReviewsPort {
  return {
    async listReviewsForUser(userId) {
      await simulateLatency();
      maybeInjectFault("listReviewsForUser");
      // The reveal rule (PRD §7.8) is enforced here, not left to the
      // caller — reviewVisible needs the full reviews array to check for
      // a mutual reply, which only the adapter has; a client-side filter
      // would need every review on every shared quest just to compute
      // this correctly, the same "over-fetching to work around a missing
      // server-side rule" problem ADR-004 exists to avoid. The mutual
      // blind is real for the ratee too, not just third parties — they
      // don't get to peek at an unrevealed review about themselves
      // either, matching the prototype's own reviewVisible call site
      // (app.js:3673), which applies unconditionally.
      return reviewsOf(reviews, userId).filter((r) => reviewVisible(reviews, r, nowMs()));
    },

    async myReviewOnQuest(questId, raterId) {
      await simulateLatency();
      maybeInjectFault("myReviewOnQuest");
      return myReviewOn(reviews, questId, raterId);
    },

    async submitReview(questId, raterId, rateeId, rating, comment, idempotency) {
      await simulateLatency();
      maybeInjectFault("submitReview");

      if (!isFirstUse("submitReview", idempotency.idempotencyKey)) {
        const cached = reviewsByKey.get(idempotency.idempotencyKey);
        if (cached) return cached;
      }

      const quest = quests.find((q) => q.id === questId);
      if (!quest) {
        throw new Error("submitReview: no such quest");
      }
      const role = roleOn(offers, quest, raterId);
      const existing = myReviewOn(reviews, questId, raterId);
      if (!canRate(quest, role, existing)) {
        if (quest.status !== "paid") throw new Error("Ratings open once the quest is paid");
        if (role !== "poster" && role !== "doer") throw new Error("Only the two people on a quest can rate it");
        throw new Error("You've already rated this one");
      }
      const counterpartId = counterpartIdOn(offers, quest, raterId);
      if (!counterpartId || counterpartId !== rateeId) {
        throw new Error("submitReview: rateeId doesn't match the other side of this quest");
      }
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Pick a star rating from 1 to 5");
      }

      const review: Review = {
        id: nextId("r"),
        questId,
        raterId,
        rateeId,
        rating,
        comment: comment.trim(),
        at: nowIso(),
      };
      reviews.push(review);
      reviewsByKey.set(idempotency.idempotencyKey, review);
      // No notification here — matches preview/app.js's own submitReview
      // exactly (a local "Rated — {name} sees it once they rate you back"
      // toast to the rater, nothing pushed to the ratee).
      return review;
    },
  };
}
