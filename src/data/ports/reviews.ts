import type { Review } from "../contracts";
import type { Idempotent } from "./common";

export interface ReviewsPort {
  /** Only the reviews currently visible about this user (PRD §7.8's
      mutual-blind reveal rule — shown once both sides have rated, or
      after 14 days) — enforced server-side since only the adapter can
      see across both directions of a rating pair. Applies to the ratee
      themselves too, not just third parties; nobody gets to peek at an
      unrevealed review about them early. */
  listReviewsForUser(userId: string): Promise<Review[]>;
  myReviewOnQuest(questId: string, raterId: string): Promise<Review | null>;
  /** Guarded the same way lifecycle transitions are: only after the
      quest's status is `paid` (PRD §7.8), enforced by the adapter, not
      trusted from the caller. */
  submitReview(
    questId: string,
    raterId: string,
    rateeId: string,
    rating: number,
    comment: string,
    idempotency: Idempotent
  ): Promise<Review>;
}
