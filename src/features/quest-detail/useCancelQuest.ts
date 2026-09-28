/* cancelQuest refunds real escrow in full (M5, escrow.ts's refundEscrow)
   whenever an accepted offer existed — ledger-internal, so nothing else
   would tell the poster's own wallet query to refetch. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { newIdempotencyKey } from "@lib/idempotency";

export interface CancelQuestInput {
  actorId: string;
  reason: string;
}

export function useCancelQuest(questId: string) {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();

  return useMutation({
    mutationFn: ({ actorId, reason }: CancelQuestInput) =>
      repository.cancelQuest(questId, actorId, reason, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests", "detail", questId] });
      queryClient.invalidateQueries({ queryKey: ["offers", "forQuest", questId] });
      queryClient.invalidateQueries({ queryKey: ["quests", "mine", session?.userId] });
      queryClient.invalidateQueries({ queryKey: ["ledger", "entries", session?.userId] });
    },
  });
}
