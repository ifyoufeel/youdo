import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { newIdempotencyKey } from "@lib/idempotency";

export function useDeclineOffer(questId: string) {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => repository.declineOffer(offerId, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", "forQuest", questId] });
    },
  });
}
