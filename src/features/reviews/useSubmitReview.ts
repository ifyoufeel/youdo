/* Mirrors useConfirmDone.ts's shape — mutate-time variables, not hook
   args. submitReview doesn't move money (unlike confirmDone), but it does
   move a quest out of bucketOf's paid-unrated carve-out, so the quests-
   mine and this-quest's-own-review queries both need invalidating for the
   Active/Done tabs and the quest-detail slab to agree with the new state
   immediately. The broad ["reviews"] prefix also covers Phase 3's public-
   profile listReviewsForUser reads once they exist. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { newIdempotencyKey } from "@lib/idempotency";

export interface SubmitReviewInput {
  questId: string;
  raterId: string;
  rateeId: string;
  rating: number;
  comment: string;
}

export function useSubmitReview() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questId, raterId, rateeId, rating, comment }: SubmitReviewInput) =>
      repository.submitReview(questId, raterId, rateeId, rating, comment, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: (_review, { questId, raterId }) => {
      queryClient.invalidateQueries({ queryKey: ["quests", "detail", questId] });
      queryClient.invalidateQueries({ queryKey: ["quests", "mine", raterId] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
