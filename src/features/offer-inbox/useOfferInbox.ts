/* The offer inbox's data hook: the quest itself, every offer on it split
   into pending/decided, and each offer's doer resolved via usePosters
   (reused as-is — same client-side join usePosters.ts's own header
   comment already documents). */
import { useQuery } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { usePosters } from "@features/browse/usePosters";

export function useOfferInbox(questId: string) {
  const repository = useRepository();

  const questQuery = useQuery({
    queryKey: ["quests", "detail", questId],
    queryFn: () => repository.getQuest(questId),
  });

  const offersQuery = useQuery({
    queryKey: ["offers", "forQuest", questId],
    queryFn: () => repository.listOffersForQuest(questId),
  });

  const offers = offersQuery.data ?? [];
  const pending = offers.filter((o) => o.status === "pending");
  const decided = offers.filter((o) => o.status !== "pending");
  const doers = usePosters(offers.map((o) => o.doerId));

  async function refetch() {
    await Promise.all([questQuery.refetch(), offersQuery.refetch()]);
  }

  return {
    quest: questQuery.data ?? null,
    pending,
    decided,
    doers,
    isLoading: questQuery.isLoading || offersQuery.isLoading,
    isError: questQuery.isError || offersQuery.isError,
    refetch,
  };
}
