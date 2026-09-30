/* Real as of M7 (scaffold — never run against a live project). The five
   lifecycle mutations (startQuest/markDone/confirmDone/cancelQuest/
   disputeQuest) go through SECURITY DEFINER RPCs
   (supabase/migrations/..._offers_lifecycle_functions.sql), same file
   offers.ts's mutations come from — they share the hold/release/refund
   escrow helpers, which is why lifecycle and offers landed in one
   migration together. subscribeToQuest's real payload stays Phase 6
   (realtime).

   listQuests and listMyQuests both go through SECURITY DEFINER RPCs
   (supabase/migrations/..._quests_functions.sql) rather than a plain
   postgrest select: PostGIS's ST_DWithin/ST_Distance aren't expressible
   through postgrest's query builder, and both need quest_address_line()
   applied per row (Phase 1) — a plain select against the quests table
   can't do that (address_line's column grant excludes it entirely).
   getQuest is a plain select, but against the quests_with_address VIEW,
   for the same address-hiding reason. */
import type { QuestsPort, PostQuestInput, ListQuestsParams } from "../../ports/quests";
import type { Quest } from "../../contracts";
import { supabase } from "./client";

const DEFAULT_LIMIT = 20;

export interface QuestRowLike {
  id: string;
  poster_id: string;
  title: string;
  payout_minor: number;
  payout_unit: "fixed";
  category_id: string;
  point_x: number;
  point_y: number;
  estimated_minutes: number;
  duration_label: string | null;
  scheduled_for: string;
  expires_at: string;
  created_at: string;
  status: Quest["status"];
  accepted_offer_id: string | null;
  address_line: string;
  area: string;
  details: string;
  requirements: string[];
  started_at: string | null;
  completed_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancel_reason: string | null;
  disputed_at: string | null;
  dispute_reason: string | null;
}

export function toQuest(row: QuestRowLike): Quest {
  return {
    id: row.id,
    posterId: row.poster_id,
    title: row.title,
    payoutMinor: row.payout_minor,
    payoutUnit: "fixed",
    categoryId: row.category_id,
    point: { x: row.point_x, y: row.point_y },
    estimatedMinutes: row.estimated_minutes,
    durationLabel: row.duration_label,
    scheduledFor: row.scheduled_for,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    status: row.status,
    acceptedOfferId: row.accepted_offer_id,
    addressLine: row.address_line,
    area: row.area,
    details: row.details,
    requirements: row.requirements ?? [],
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    paidAt: row.paid_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    cancelledBy: row.cancelled_by ?? undefined,
    cancelReason: row.cancel_reason ?? undefined,
    disputedAt: row.disputed_at ?? undefined,
    disputeReason: row.dispute_reason ?? undefined,
  };
}

function offsetOf(cursor: string | null | undefined): number {
  return cursor ? Number(cursor) : 0;
}

export function createSupabaseQuestsPort(): QuestsPort {
  return {
    async listQuests(params: ListQuestsParams) {
      const limit = params.limit ?? DEFAULT_LIMIT;
      const offset = offsetOf(params.cursor);
      const { data, error } = await supabase().rpc("list_quests", {
        p_center_x: params.center.x,
        p_center_y: params.center.y,
        p_radius_m: params.radiusM,
        p_category_id: params.categoryId ?? null,
        p_min_pay_minor: params.minPayMinor ?? null,
        p_verified_posters_only: params.verifiedPostersOnly ?? false,
        p_today_only: params.todayOnly ?? false,
        p_search: params.search ?? null,
        p_sort: params.sort ?? "closest",
        p_viewer_id: params.viewerId ?? null,
        p_limit: limit,
        p_offset: offset,
      });
      if (error) throw error;
      const rows = (data ?? []) as (QuestRowLike & { total_count: number })[];
      const items = rows.map(toQuest);
      const totalCount = rows[0]?.total_count ?? 0;
      const nextCursor = offset + items.length < totalCount ? String(offset + items.length) : null;
      return { items, nextCursor };
    },

    async getQuest(id) {
      const { data, error } = await supabase().from("quests_with_address").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? toQuest(data as QuestRowLike) : null;
    },

    async postQuest(input: PostQuestInput, idempotency) {
      const { data, error } = await supabase().rpc("post_quest", {
        p_title: input.title,
        p_details: input.details,
        p_category_id: input.categoryId,
        p_payout_minor: input.payoutMinor,
        p_estimated_minutes: input.estimatedMinutes,
        p_duration_label: input.durationLabel,
        p_address_line: input.addressLine,
        p_area: input.area,
        p_point_x: input.point.x,
        p_point_y: input.point.y,
        p_scheduled_for: input.scheduledFor,
        p_expires_at: input.expiresAt,
        p_requirements: input.requirements,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toQuest(data as QuestRowLike);
    },

    async listMyQuests() {
      const { data, error } = await supabase().rpc("list_my_quests");
      if (error) throw error;
      return ((data ?? []) as QuestRowLike[]).map(toQuest);
    },

    async startQuest(questId, _actorId, idempotency) {
      const { data, error } = await supabase().rpc("start_quest", {
        p_quest_id: questId,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toQuest(data as QuestRowLike);
    },

    async markDone(questId, _actorId, idempotency) {
      const { data, error } = await supabase().rpc("mark_done", {
        p_quest_id: questId,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toQuest(data as QuestRowLike);
    },

    async confirmDone(questId, _actorId, idempotency) {
      const { data, error } = await supabase().rpc("confirm_done", {
        p_quest_id: questId,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toQuest(data as QuestRowLike);
    },

    async cancelQuest(questId, _actorId, reason, idempotency) {
      const { data, error } = await supabase().rpc("cancel_quest", {
        p_quest_id: questId,
        p_reason: reason,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toQuest(data as QuestRowLike);
    },

    async disputeQuest(questId, _actorId, reason, idempotency) {
      const { data, error } = await supabase().rpc("dispute_quest", {
        p_quest_id: questId,
        p_reason: reason,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toQuest(data as QuestRowLike);
    },

    async listSavedQuestIds(userId) {
      const { data, error } = await supabase().from("saved_quests").select("quest_id").eq("user_id", userId);
      if (error) throw error;
      return ((data ?? []) as { quest_id: string }[]).map((row) => row.quest_id);
    },

    async saveQuest(userId, questId) {
      // upsert + ignoreDuplicates makes a replay (same user, same quest,
      // saved twice) a no-op instead of a primary-key-violation error —
      // saved_quests' PK is (user_id, quest_id) itself, so no dedicated
      // idempotency-key column is needed here, matching Set.add's own
      // natural idempotency in the memory adapter.
      const { error } = await supabase()
        .from("saved_quests")
        .upsert({ user_id: userId, quest_id: questId }, { onConflict: "user_id,quest_id", ignoreDuplicates: true });
      if (error) throw error;
    },

    async unsaveQuest(userId, questId) {
      const { error } = await supabase().from("saved_quests").delete().eq("user_id", userId).eq("quest_id", questId);
      if (error) throw error;
    },

    /** Real payload once Phase 6 wires realtime — a typed no-op until
        then, same as the memory adapter's own subscribeToQuest today. */
    subscribeToQuest() {
      return { unsubscribe() {} };
    },
  };
}
