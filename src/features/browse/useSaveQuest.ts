/* Optimistic save/unsave: the heart icon flips the instant it's tapped
   (onMutate patches the ["savedQuestIds", userId] cache directly), and
   rolls back to the pre-mutation snapshot if the memory adapter's
   fault-injection switch (ADR-008) makes the call fail. First real
   instance of this pattern in the app — later mutating hooks (M2's
   offers, M3's saved-list actions) copy it rather than reinvent it. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { newIdempotencyKey } from "@lib/idempotency";

interface SaveQuestVars {
  questId: string;
  saved: boolean; // the NEXT desired state
}

interface MutationContext {
  previous: string[] | undefined;
}

export function useSaveQuest() {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const userId = session?.userId;
  const key = ["savedQuestIds", userId];

  const mutation = useMutation<void, Error, SaveQuestVars, MutationContext>({
    mutationFn: async ({ questId, saved }) => {
      if (!userId) throw new Error("useSaveQuest() called while signed out");
      const idempotency = { idempotencyKey: newIdempotencyKey() };
      if (saved) {
        await repository.saveQuest(userId, questId, idempotency);
      } else {
        await repository.unsaveQuest(userId, questId, idempotency);
      }
    },
    onMutate: async ({ questId, saved }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key);
      const next = new Set(previous ?? []);
      if (saved) next.add(questId);
      else next.delete(questId);
      queryClient.setQueryData(key, Array.from(next));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  return {
    toggleSave: (questId: string, currentlySaved: boolean) =>
      mutation.mutate({ questId, saved: !currentlySaved }),
    isSaving: mutation.isPending,
  };
}
