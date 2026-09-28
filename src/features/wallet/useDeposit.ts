/* Deposit into the wallet — returns the pending Payment immediately (the
   port's real return type since M5 Phase 2); invalidates the same query
   keys useWallet reads so both the balance and history pick it up as soon
   as it lands, then again once useWallet's own poll observes it settle. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { newIdempotencyKey } from "@lib/idempotency";

export function useDeposit() {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const userId = session?.userId as string;

  return useMutation({
    mutationFn: (amountMinor: number) =>
      repository.deposit(userId, amountMinor, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger", "entries", userId] });
      queryClient.invalidateQueries({ queryKey: ["ledger", "payments", userId] });
    },
  });
}
