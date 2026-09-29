/* PRD §7.8's mutual-rating reveal rule, ported from preview/app.js:524-541
   (reviewsOf/myReviewOn/REVIEW_REVEAL_MS/reviewVisible) — a review shows
   once the ratee has rated the rater back on the same quest, or 14 days
   pass, whichever comes first. Pure, no store imports, same discipline as
   lifecycle.ts/fees.ts/ledger.ts. */
import type { Quest, Review } from "../contracts";
import type { Role } from "./lifecycle";

export const REVIEW_REVEAL_MS = 14 * 24 * 60 * 60 * 1000;

export function reviewsOf(reviews: readonly Review[], userId: string): Review[] {
  return reviews.filter((r) => r.rateeId === userId);
}

export function myReviewOn(reviews: readonly Review[], questId: string, raterId: string): Review | null {
  return reviews.find((r) => r.questId === questId && r.raterId === raterId) ?? null;
}

/** Visible once the ratee has rated the rater back on the same quest
    (`myReviewOn` with the ratee/rater roles swapped from the review being
    checked), or once REVIEW_REVEAL_MS has passed — whichever comes
    first. */
export function reviewVisible(reviews: readonly Review[], review: Review, nowMs: number): boolean {
  const ratedBack = myReviewOn(reviews, review.questId, review.rateeId);
  return !!ratedBack || nowMs - Date.parse(review.at) >= REVIEW_REVEAL_MS;
}

/** A quest can be rated once it's paid, by either side of it, once each —
    ported from preview/app.js:1058-1062's own submitReview guards. */
export function canRate(quest: Quest, role: Role, myReview: Review | null): boolean {
  return quest.status === "paid" && (role === "poster" || role === "doer") && !myReview;
}
