import type { Review } from "../contracts";
import type { Idempotent } from "./common";

export interface ReviewsPort {
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
