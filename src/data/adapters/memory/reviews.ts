import type { ReviewsPort } from "../../ports/reviews";
import { NotImplementedYet } from "./not-implemented";

/* Reviews only make sense once a quest can actually reach `paid` (M5's
   lifecycle work) — stubbed until then. */
export function createMemoryReviewsPort(): ReviewsPort {
  return {
    async listReviewsForUser() {
      throw new NotImplementedYet("listReviewsForUser", "M6");
    },
    async myReviewOnQuest() {
      throw new NotImplementedYet("myReviewOnQuest", "M6");
    },
    async submitReview() {
      throw new NotImplementedYet("submitReview", "M6");
    },
  };
}
