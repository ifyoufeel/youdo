import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { newIdempotencyKey } from "@lib/idempotency";

export function useSendMessage(threadId: string) {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();

  return useMutation({
    mutationFn: (body: string) => {
      if (!session) throw new Error("Not signed in");
      return repository.sendMessage(threadId, session.userId, body, { idempotencyKey: newIdempotencyKey() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads", "messages", threadId] });
      queryClient.invalidateQueries({ queryKey: ["threads", "list", session?.userId] });
      queryClient.invalidateQueries({ queryKey: ["threads", "detail", threadId] });
    },
  });
}
