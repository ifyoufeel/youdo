/* One thread's full data — the thread row, its messages, its quest and
   the offer that amount comes from, plus the viewer's role/address-
   visibility (same lifecycle.ts selectors QuestDetailScreen already
   reads). Marks the thread read whenever its message count changes —
   mirrors app.js's own useEffect(markThreadRead, [thread.id, msgs.length]). */
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { usePosters } from "@features/browse/usePosters";
import { otherSideOf } from "@data/domain/threads";
import { roleOn, addressVisibleTo, isClosed } from "@data/domain/lifecycle";

export function useThread(threadId: string) {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const userId = session?.userId;

  const threadQuery = useQuery({
    queryKey: ["threads", "detail", threadId],
    queryFn: () => repository.getThread(threadId),
  });
  const messagesQuery = useQuery({
    queryKey: ["threads", "messages", threadId],
    queryFn: () => repository.listMessages(threadId),
  });

  const thread = threadQuery.data ?? null;
  const questId = thread?.questId;

  const questQuery = useQuery({
    queryKey: ["quests", "detail", questId],
    queryFn: () => repository.getQuest(questId as string),
    enabled: !!questId,
  });
  const offersQuery = useQuery({
    queryKey: ["offers", "forQuest", questId],
    queryFn: () => repository.listOffersForQuest(questId as string),
    enabled: !!questId,
  });
  const myOfferQuery = useQuery({
    queryKey: ["offers", "myOffer", questId, thread?.doerId],
    queryFn: () => repository.myOfferOnQuest(questId as string, thread!.doerId),
    enabled: !!questId && !!thread,
  });

  const messages = messagesQuery.data ?? [];
  const quest = questQuery.data ?? null;
  const offers = offersQuery.data ?? [];
  const role = quest && userId ? roleOn(offers, quest, userId) : "visitor";
  const addressVisible = quest && userId ? addressVisibleTo(quest, offers, userId) : false;
  const closed = quest ? isClosed(quest.status) : false;
  const otherId = thread && userId ? otherSideOf(thread, userId) : null;
  const others = usePosters(otherId ? [otherId] : []);
  const other = otherId ? (others.get(otherId) ?? null) : null;

  useEffect(() => {
    if (!thread || !userId) return;
    repository.markThreadRead(thread.id, userId).then(() => {
      queryClient.invalidateQueries({ queryKey: ["threads", "list", userId] });
      queryClient.invalidateQueries({ queryKey: ["threads", "unread", thread.id, userId] });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread?.id, messages.length, userId]);

  return {
    thread,
    quest,
    messages,
    offer: myOfferQuery.data ?? null,
    role,
    addressVisible,
    closed,
    other,
    // Gated on the cascading quest/offers query too (same "loading" vs
    // "signedOut" distinction useQuestDetail's own header comment calls
    // out) — otherwise closed/role/addressVisible can briefly read their
    // still-null-quest fallback values before the quest query resolves.
    isLoading: threadQuery.isLoading || messagesQuery.isLoading || (!!questId && questQuery.isLoading) || (!!questId && offersQuery.isLoading),
    isError: threadQuery.isError || messagesQuery.isError,
  };
}
