/* Real as of M7 (scaffold — never run against a live project).
   listForUser is a plain read (Phase 1's notifications_own RLS policy
   scopes it). markAllRead needs the mark_all_read RPC (Phase 1 grants
   notifications SELECT only, no UPDATE). subscribeToUser's realtime
   payload has no hidden-column concern (same reasoning threads.ts gives
   for its own subscribeToThread), so it maps the pushed row directly. */
import type { NotificationsPort } from "../../ports/notifications";
import type { Notification } from "../../contracts";
import { supabase } from "./client";
import type { NotificationRow } from "./database.types";

function toNotification(row: NotificationRow): Notification {
  return { id: row.id, userId: row.user_id, type: row.type, questId: row.quest_id, body: row.body, at: row.at, readAt: row.read_at };
}

export function createSupabaseNotificationsPort(): NotificationsPort {
  return {
    async listForUser(userId) {
      const { data, error } = await supabase()
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as NotificationRow[]).map(toNotification);
    },

    async markAllRead(_userId, idempotency) {
      const { error } = await supabase().rpc("mark_all_read", { p_idempotency_key: idempotency.idempotencyKey });
      if (error) throw error;
    },

    subscribeToUser(userId, onNotification) {
      const channel = supabase()
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          (payload: { new: NotificationRow }) => onNotification(toNotification(payload.new))
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
