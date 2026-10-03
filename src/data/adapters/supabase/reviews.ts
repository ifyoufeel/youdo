/* Real as of M7 (scaffold — never run against a live project).
   listReviewsForUser/myReviewOnQuest are plain reads; Phase 1's
   reviews_visible RLS policy (fixed in Phase 7's own migration — see its
   header comment) is what actually enforces PRD §7.8's mutual-blind
   reveal rule, so the query itself doesn't need to. submitReview goes
   through the submit_review RPC, which ports the memory adapter's exact
   canRate/counterpart guard order. */
import type { ReviewsPort } from "../../ports/reviews";
import type { Review } from "../../contracts";
import { supabase } from "./client";
import type { ReviewRow } from "./database.types";

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    questId: row.quest_id,
    raterId: row.rater_id,
    rateeId: row.ratee_id,
    rating: row.rating,
    comment: row.comment,
    at: row.at,
  };
}

export function createSupabaseReviewsPort(): ReviewsPort {
  return {
    async listReviewsForUser(userId) {
      const { data, error } = await supabase().from("reviews").select("*").eq("ratee_id", userId);
      if (error) throw error;
      return ((data ?? []) as ReviewRow[]).map(toReview);
    },

    async myReviewOnQuest(questId, raterId) {
      const { data, error } = await supabase()
        .from("reviews")
        .select("*")
        .eq("quest_id", questId)
        .eq("rater_id", raterId)
        .maybeSingle();
      if (error) throw error;
      return data ? toReview(data as ReviewRow) : null;
    },

    async submitReview(questId, _raterId, rateeId, rating, comment, idempotency) {
      const { data, error } = await supabase().rpc("submit_review", {
        p_quest_id: questId,
        p_ratee_id: rateeId,
        p_rating: rating,
        p_comment: comment,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toReview(data as ReviewRow);
    },
  };
}
