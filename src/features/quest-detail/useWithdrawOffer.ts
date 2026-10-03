import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { newIdempotencyKey } from "@lib/idempotency";

export function useWithdrawOffer(questId: string) {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => repository.withdrawOffer(offerId, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", "forQuest", questId] });
    },
  });
}
