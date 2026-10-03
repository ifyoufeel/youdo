/* Chats tab's data hook: every thread the signed-in user is a side of,
   each joined client-side with its other participant, quest, last
   message, and unread count — the same N+1-per-thread shape useMyQuests's
   own header comment already documents for offers-per-quest. A second N+1
   (unreadCountForThread) sits on top of the first (listMessages) here,
   flagged explicitly since two N+1s in one screen could otherwise read as
   an oversight rather than a deliberate fixture-scale simplification. */
import { useQuery, useQueries } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { usePosters } from "@features/browse/usePosters";
import { otherSideOf } from "@data/domain/threads";
import type { Thread, Message, Quest, User } from "@data/contracts";

export interface ChatThreadSummary {
  thread: Thread;
  other: User | null;
  quest: Quest | null;
  lastMessage: Message | null;
  unreadCount: number;
}

export function useThreads() {
  const repository = useRepository();
  const { session } = useAuthSession();
  const userId = session?.userId;

  const threadsQuery = useQuery({
    queryKey: ["threads", "list", userId],
    queryFn: () => repository.listThreadsForUser(userId as string),
    enabled: !!userId,
  });
  const threads = threadsQuery.data ?? [];

  const messagesResults = useQueries({
    queries: threads.map((t) => ({
      queryKey: ["threads", "messages", t.id],
      queryFn: () => repository.listMessages(t.id),
    })),
  });
  const unreadResults = useQueries({
    queries: threads.map((t) => ({
      queryKey: ["threads", "unread", t.id, userId],
      queryFn: () => repository.unreadCountForThread(t.id, userId as string),
      enabled: !!userId,
    })),
  });

  const questIds = Array.from(new Set(threads.map((t) => t.questId)));
  const questResults = useQueries({
    queries: questIds.map((id) => ({ queryKey: ["quests", "detail", id], queryFn: () => repository.getQuest(id) })),
  });
  const questsById = new Map<string, Quest | null>();
  questIds.forEach((id, i) => questsById.set(id, questResults[i]?.data ?? null));

  const otherIds = userId ? threads.map((t) => otherSideOf(t, userId)) : [];
  const others = usePosters(otherIds);

  const summaries: ChatThreadSummary[] = threads.map((t, i) => {
    const messages = messagesResults[i]?.data ?? [];
    return {
      thread: t,
      other: userId ? (others.get(otherSideOf(t, userId)) ?? null) : null,
      quest: questsById.get(t.questId) ?? null,
      lastMessage: messages.length ? messages[messages.length - 1] : null,
      unreadCount: unreadResults[i]?.data ?? 0,
    };
  });

  return {
    // listThreadsForUser already returns newest-activity-first (domain/threads.ts's threadsFor).
    summaries,
    isLoading: threadsQuery.isLoading || messagesResults.some((r) => r.isLoading) || unreadResults.some((r) => r.isLoading),
    isError: threadsQuery.isError,
    refetch: threadsQuery.refetch,
  };
}
