/* The offer inbox's data hook: the quest itself, every offer on it split
   into pending/decided, each offer's doer resolved via usePosters
   (reused as-is — same client-side join usePosters.ts's own header
   comment already documents), and the poster's own thread list, so each
   OfferRow can resolve its own "Open chat" destination via threadFor —
   sendOffer always creates one, so every offer here has a real thread. */
import { useQuery } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { usePosters } from "@features/browse/usePosters";

export function useOfferInbox(questId: string) {
  const repository = useRepository();
  const { session } = useAuthSession();
  const userId = session?.userId;

  const questQuery = useQuery({
    queryKey: ["quests", "detail", questId],
    queryFn: () => repository.getQuest(questId),
  });

  const offersQuery = useQuery({
    queryKey: ["offers", "forQuest", questId],
    queryFn: () => repository.listOffersForQuest(questId),
  });

  const threadsQuery = useQuery({
    queryKey: ["threads", "list", userId],
    queryFn: () => repository.listThreadsForUser(userId as string),
    enabled: !!userId,
  });

  const offers = offersQuery.data ?? [];
  const pending = offers.filter((o) => o.status === "pending");
  const decided = offers.filter((o) => o.status !== "pending");
  const doers = usePosters(offers.map((o) => o.doerId));
  const threads = threadsQuery.data ?? [];

  async function refetch() {
    await Promise.all([questQuery.refetch(), offersQuery.refetch()]);
  }

  return {
    quest: questQuery.data ?? null,
    pending,
    decided,
    doers,
    threads,
    isLoading: questQuery.isLoading || offersQuery.isLoading,
    isError: questQuery.isError || offersQuery.isError,
    refetch,
  };
}
