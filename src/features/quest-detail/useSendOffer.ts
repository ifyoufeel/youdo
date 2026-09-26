/* Sends a real offer and invalidates useQuestDetail's queries on success
   so the screen picks up the new offer (and, for the viewer, their new
   "applicant" role) without a manual refetch. Guard rejections (own
   quest, not open, duplicate, non-positive amount — all real, from the
   memory adapter's sendOffer) surface as the mutation's own error, for
   OfferSheet to show inline rather than a toast. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { newIdempotencyKey } from "@lib/idempotency";

export interface SendOfferInput {
  questId: string;
  doerId: string;
  amountMinor: number;
  note: string;
}

export function useSendOffer() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questId, doerId, amountMinor, note }: SendOfferInput) =>
      repository.sendOffer(questId, doerId, amountMinor, note, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: (_offer, { questId }) => {
      queryClient.invalidateQueries({ queryKey: ["offers", "forQuest", questId] });
      queryClient.invalidateQueries({ queryKey: ["quests", "detail", questId] });
    },
  });
}
