/* Mirrors useSendOffer.ts's own mutation-hook shape: idempotency key via
   newIdempotencyKey(), cache invalidation on success. postQuest affects
   two different lists — the browse feed and My Quests — so both get
   invalidated. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { newIdempotencyKey } from "@lib/idempotency";
import type { PostQuestInput } from "@data/ports/quests";

export function usePostQuest() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PostQuestInput) => repository.postQuest(input, { idempotencyKey: newIdempotencyKey() }),
    // Prefix match — invalidates the browse feed's ["quests","feed",...]
    // and My Quests' ["quests","mine",userId] alike, one call.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
    },
  });
}
