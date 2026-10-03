/* Mirrors useMarkDone.ts's shape — questId/actorId are mutate-time
   variables, not hook args, same reasoning. confirmDone releases real
   escrow (M5) as a side effect of the completed->paid transition, so this
   also invalidates the poster's own ledger/payments queries — the only
   mutation hook in this file that touches wallet state, since the others
   (start/mark-done/cancel) either move no money or (cancel) refund
   through the same quest/offer transition without a separate hold to
   release here. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { newIdempotencyKey } from "@lib/idempotency";

export interface ConfirmDoneInput {
  questId: string;
  actorId: string;
}

export function useConfirmDone() {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();

  return useMutation({
    mutationFn: ({ questId, actorId }: ConfirmDoneInput) =>
      repository.confirmDone(questId, actorId, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: (_quest, { questId }) => {
      queryClient.invalidateQueries({ queryKey: ["quests", "detail", questId] });
      queryClient.invalidateQueries({ queryKey: ["quests", "mine", session?.userId] });
      queryClient.invalidateQueries({ queryKey: ["ledger", "entries", session?.userId] });
      queryClient.invalidateQueries({ queryKey: ["ledger", "payments", session?.userId] });
    },
  });
}
