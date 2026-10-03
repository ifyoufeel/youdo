/* Resolves listSavedQuestIds (real since M1) to the full Quest records —
   a second N+1 layer over usePosters' own established shape, one getQuest
   per saved id via useQueries. Small per-user, no pagination, same
   "fine at fixture scale" reasoning listSavedQuestIds' own port comment
   already gives. */
import { useQuery, useQueries } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { usePosters } from "@features/browse/usePosters";
import type { Quest } from "@data/contracts";

export function useSavedQuests() {
  const repository = useRepository();
  const { session } = useAuthSession();
  const userId = session?.userId;

  const idsQuery = useQuery({
    queryKey: ["savedQuestIds", userId],
    queryFn: () => repository.listSavedQuestIds(userId as string),
    enabled: !!userId,
  });
  const ids = idsQuery.data ?? [];

  const questResults = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["quests", "detail", id],
      queryFn: () => repository.getQuest(id),
    })),
  });

  const quests: Quest[] = questResults
    .map((r) => r.data)
    .filter((q): q is Quest => q != null);
  const posters = usePosters(quests.map((q) => q.posterId));

  return {
    quests,
    posters,
    isLoading: idsQuery.isLoading || questResults.some((r) => r.isLoading),
    isError: idsQuery.isError,
  };
}
