/* Real as of M7 (scaffold — never run against a live project).
   listThreadsForUser/getThread/listMessages skip an explicit
   poster_id/doer_id filter on purpose: Phase 1's threads_select/
   messages_select RLS policies already scope every row to a thread the
   caller is actually a participant of, so a client-side filter would
   only ever narrow to the same set RLS already guarantees — leaving it
   out keeps the query simple and makes the reliance on RLS explicit
   rather than accidentally duplicated. sendMessage/markThreadRead and
   subscribeToThread's realtime wiring have no such hidden-column concern
   the way quests.ts's subscribeToQuest does (see that file's own
   comment) — a message's raw row has nothing that needs hiding, so the
   realtime payload is mapped directly. */
import type { ThreadsPort } from "../../ports/threads";
import type { Thread, Message } from "../../contracts";
import { supabase } from "./client";

interface ThreadRowLike {
  id: string;
  quest_id: string;
  poster_id: string;
  doer_id: string;
  last_message_at: string;
}

interface MessageRowLike {
  id: string;
  sender_id: string;
  body: string;
  at: string;
}

function toThread(row: ThreadRowLike): Thread {
  return { id: row.id, questId: row.quest_id, posterId: row.poster_id, doerId: row.doer_id, lastMessageAt: row.last_message_at };
}

function toMessage(row: MessageRowLike): Message {
  return { id: row.id, senderId: row.sender_id, body: row.body, at: row.at };
}

export function createSupabaseThreadsPort(): ThreadsPort {
  return {
    async listThreadsForUser() {
      const { data, error } = await supabase()
        .from("threads")
        .select("*")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as ThreadRowLike[]).map(toThread);
    },

    async getThread(id) {
      const { data, error } = await supabase().from("threads").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? toThread(data as ThreadRowLike) : null;
    },

    async listMessages(threadId) {
      const { data, error } = await supabase()
        .from("messages")
        .select("id, sender_id, body, at")
        .eq("thread_id", threadId)
        .order("at", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as MessageRowLike[]).map(toMessage);
    },

    async unreadCountForThread(threadId, userId) {
      const { data: readRow, error: readError } = await supabase()
        .from("thread_read_at")
        .select("read_at")
        .eq("thread_id", threadId)
        .eq("user_id", userId)
        .maybeSingle();
      if (readError) throw readError;
      const readAt = (readRow as { read_at: string } | null)?.read_at ?? null;

      let query = supabase()
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("thread_id", threadId)
        .neq("sender_id", userId);
      if (readAt) query = query.gt("at", readAt);
      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    },

    async sendMessage(threadId, _senderId, body, idempotency) {
      const { data, error } = await supabase().rpc("send_message", {
        p_thread_id: threadId,
        p_body: body,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toMessage(data as MessageRowLike);
    },

    async markThreadRead(threadId, userId) {
      const { error } = await supabase()
        .from("thread_read_at")
        .upsert({ user_id: userId, thread_id: threadId, read_at: new Date().toISOString() }, { onConflict: "user_id,thread_id" });
      if (error) throw error;
    },

    subscribeToThread(threadId, onMessage) {
      const channel = supabase()
        .channel(`thread:${threadId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
          (payload: { new: MessageRowLike }) => onMessage(toMessage(payload.new))
        )
        .subscribe();
      return {
        unsubscribe() {
          supabase().removeChannel(channel);
        },
      };
    },
  };
}
