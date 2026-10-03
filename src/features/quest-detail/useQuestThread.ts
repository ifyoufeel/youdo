/* Resolves the one real thread for this quest's (questId, doerId) pair
   (PRD §7.5) so QuestDetailScreen's slab can offer a real "Open chat"
   button — reuses ChatsScreen's own ["threads","list",userId] query key,
   so visiting either screen shares the same cache. */
import { useQuery } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { threadFor } from "@data/domain/threads";

export function useQuestThread(questId: string, doerId: string | null) {
  const repository = useRepository();
  const { session } = useAuthSession();
  const userId = session?.userId;

  const threadsQuery = useQuery({
    queryKey: ["threads", "list", userId],
    queryFn: () => repository.listThreadsForUser(userId as string),
    enabled: !!userId,
  });

  const threads = threadsQuery.data ?? [];
  return doerId ? threadFor(threads, questId, doerId) : null;
}
