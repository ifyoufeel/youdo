/* questId is a mutate-time variable, not a hook argument — same reasoning
   useStartQuest.ts gives (shared across a list of EngagementCards). */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { newIdempotencyKey } from "@lib/idempotency";

export interface MarkDoneInput {
  questId: string;
  actorId: string;
}

export function useMarkDone() {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();

  return useMutation({
    mutationFn: ({ questId, actorId }: MarkDoneInput) =>
      repository.markDone(questId, actorId, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: (_quest, { questId }) => {
      queryClient.invalidateQueries({ queryKey: ["quests", "detail", questId] });
      queryClient.invalidateQueries({ queryKey: ["quests", "mine", session?.userId] });
    },
  });
}
