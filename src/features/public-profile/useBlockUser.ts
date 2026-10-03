/* Blocking changes what the browse feed shows the blocker (listQuests'
   new viewerId param, M6 Phase 3), so this invalidates the feed's whole
   query family — same broad-prefix invalidation useSendOffer/useSaveQuest
   already use for the same reason (a filter param changed what a cached
   page should contain). */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { newIdempotencyKey } from "@lib/idempotency";

export interface BlockUserInput {
  userId: string;
  blockedId: string;
}

export function useBlockUser() {
  const repository = useRepository();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, blockedId }: BlockUserInput) =>
      repository.blockUser(userId, blockedId, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests", "feed"] });
    },
  });
}
