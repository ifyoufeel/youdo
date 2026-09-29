/* Anonymizes the account (UsersPort.deleteAccount, real since this
   phase) then signs the session out — the screen navigates to
   onboarding itself, the same explicit redirect app/index.tsx's own
   cold-start gate uses, since nothing re-checks auth status once a
   screen under (tabs) is already mounted. */
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { newIdempotencyKey } from "@lib/idempotency";

export function useDeleteAccount() {
  const repository = useRepository();
  const { session, signOut } = useAuthSession();
  const router = useRouter();

  return useMutation({
    mutationFn: () => repository.deleteAccount(session?.userId as string, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: async () => {
      await signOut();
      router.replace("/(onboarding)/welcome");
    },
  });
}
