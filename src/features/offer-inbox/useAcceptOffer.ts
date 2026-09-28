/* acceptOffer's own result already carries both the updated offer and
   quest (src/data/ports/offers.ts's own return shape), so this just needs
   to invalidate every query the screens reading either one depend on:
   this quest's offers, its own detail, and the signed-in user's "My
   quests" list (its bucket membership changes the moment a quest goes
   open -> assigned). acceptOffer also holds real escrow now (M5) —
   ledger-internal, settling atomically with no Payment/polling to catch
   it later, so the poster's own wallet query needs the same explicit
   invalidate or it'd show a stale "In your wallet" figure. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { newIdempotencyKey } from "@lib/idempotency";

export function useAcceptOffer(questId: string) {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();

  return useMutation({
    mutationFn: (offerId: string) => repository.acceptOffer(offerId, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", "forQuest", questId] });
      queryClient.invalidateQueries({ queryKey: ["quests", "detail", questId] });
      queryClient.invalidateQueries({ queryKey: ["quests", "mine", session?.userId] });
      queryClient.invalidateQueries({ queryKey: ["ledger", "entries", session?.userId] });
    },
  });
}
