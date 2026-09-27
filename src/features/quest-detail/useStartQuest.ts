/* questId is a mutate-time variable, not a hook argument — QuestDetailScreen
   uses one instance for its own quest, but MyQuestsScreen needs one shared
   instance across a whole list of EngagementCards (a hook can't be called
   once per list item), so the shape has to support both from day one. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { newIdempotencyKey } from "@lib/idempotency";

export interface StartQuestInput {
  questId: string;
  actorId: string;
}

export function useStartQuest() {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();

  return useMutation({
    mutationFn: ({ questId, actorId }: StartQuestInput) =>
      repository.startQuest(questId, actorId, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: (_quest, { questId }) => {
      queryClient.invalidateQueries({ queryKey: ["quests", "detail", questId] });
      queryClient.invalidateQueries({ queryKey: ["quests", "mine", session?.userId] });
    },
  });
}
