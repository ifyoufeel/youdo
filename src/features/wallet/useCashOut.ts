/* Cash out from the wallet — same shape as useDeposit, the mirror
   direction. The memory adapter itself rejects an amount over `spendable`;
   this hook just wires the call through, the same "guards live in the
   adapter, not the hook" split every other mutation hook here follows. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { newIdempotencyKey } from "@lib/idempotency";

export function useCashOut() {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const userId = session?.userId as string;

  return useMutation({
    mutationFn: (amountMinor: number) =>
      repository.cashOut(userId, amountMinor, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger", "entries", userId] });
      queryClient.invalidateQueries({ queryKey: ["ledger", "payments", userId] });
    },
  });
}
