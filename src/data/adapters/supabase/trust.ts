/* Real as of M7 (scaffold — never run against a live project). blockUser/
   listBlockedUserIds go straight to blocked_users (Phase 1's RLS policy
   plus the no-self-block check constraint already cover them — no guard
   logic an RPC would add, same reasoning saved_quests' direct writes get
   in quests.ts). reportUser goes through the report_user RPC, which
   needs the dedicated idempotency-key result cache (no natural lookup —
   a person can legitimately report the same target twice). */
import type { TrustPort } from "../../ports/trust";
import type { Report } from "../../contracts";
import { supabase } from "./client";
import type { ReportRow } from "./database.types";

function toReport(row: ReportRow): Report {
  return { id: row.id, reporterId: row.reporter_id, targetUserId: row.target_user_id, reason: row.reason, at: row.at };
}

export function createSupabaseTrustPort(): TrustPort {
  return {
    async reportUser(_reporterId, targetUserId, reason, idempotency) {
      const { data, error } = await supabase().rpc("report_user", {
        p_target_user_id: targetUserId,
        p_reason: reason,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toReport(data as ReportRow);
    },

    async blockUser(userId, blockedId) {
      const { error } = await supabase()
        .from("blocked_users")
        .upsert({ user_id: userId, blocked_id: blockedId }, { onConflict: "user_id,blocked_id", ignoreDuplicates: true });
      if (error) throw error;
    },

    async listBlockedUserIds(userId) {
      const { data, error } = await supabase().from("blocked_users").select("blocked_id").eq("user_id", userId);
      if (error) throw error;
      return ((data ?? []) as { blocked_id: string }[]).map((row) => row.blocked_id);
    },
  };
}
