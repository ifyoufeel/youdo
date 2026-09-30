/* Real as of M7 (scaffold — never run against a live project).
   sendOffer/withdrawOffer/declineOffer/acceptOffer all go through
   SECURITY DEFINER RPCs (supabase/migrations/
   ..._offers_lifecycle_functions.sql) — every one of them has real guard
   logic (own-quest rejection, one-active-offer-per-doer, ownership
   checks, the funds check on accept, auto-declining the rest), the exact
   kind of mutation Phase 1's migration reserves for RPCs rather than a
   direct table write. listOffersForQuest/myOfferOnQuest are plain reads,
   scoped by Phase 1's offers_select RLS policy (poster sees every offer
   on their quest; a doer sees only their own). */
import type { OffersPort } from "../../ports/offers";
import type { Offer } from "../../contracts";
import { supabase } from "./client";
import { toQuest } from "./quests";
import type { QuestRowLike } from "./quests";

interface OfferRowLike {
  id: string;
  quest_id: string;
  doer_id: string;
  amount_minor: number;
  status: Offer["status"];
  note: string;
  created_at: string;
  responded_at: string | null;
}

function toOffer(row: OfferRowLike): Offer {
  return {
    id: row.id,
    questId: row.quest_id,
    doerId: row.doer_id,
    amountMinor: row.amount_minor,
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}

export function createSupabaseOffersPort(): OffersPort {
  return {
    async listOffersForQuest(questId) {
      const { data, error } = await supabase().from("offers").select("*").eq("quest_id", questId);
      if (error) throw error;
      return ((data ?? []) as OfferRowLike[]).map(toOffer);
    },

    async myOfferOnQuest(questId, doerId) {
      const { data, error } = await supabase()
        .from("offers")
        .select("*")
        .eq("quest_id", questId)
        .eq("doer_id", doerId)
        .in("status", ["pending", "accepted"])
        .maybeSingle();
      if (error) throw error;
      return data ? toOffer(data as OfferRowLike) : null;
    },

    // doerId isn't sent to the RPC — send_offer always inserts as
    // auth.uid(), never a client-supplied id (same posture as
    // post_quest ignoring PostQuestInput.posterId).
    async sendOffer(questId, _doerId, amountMinor, note, idempotency) {
      const { data, error } = await supabase().rpc("send_offer", {
        p_quest_id: questId,
        p_amount_minor: amountMinor,
        p_note: note,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toOffer(data as OfferRowLike);
    },

    async withdrawOffer(offerId, idempotency) {
      const { data, error } = await supabase().rpc("withdraw_offer", {
        p_offer_id: offerId,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toOffer(data as OfferRowLike);
    },

    async declineOffer(offerId, idempotency) {
      const { data, error } = await supabase().rpc("decline_offer", {
        p_offer_id: offerId,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      return toOffer(data as OfferRowLike);
    },

    async acceptOffer(offerId, idempotency) {
      const { data, error } = await supabase().rpc("accept_offer", {
        p_offer_id: offerId,
        p_idempotency_key: idempotency.idempotencyKey,
      });
      if (error) throw error;
      // accept_offer RETURNS TABLE(offer offers, quest quests) — PostgREST
      // serializes each composite column as a nested JSON object, and a
      // table-returning function always comes back as an array of rows.
      const row = (Array.isArray(data) ? data[0] : data) as { offer: OfferRowLike; quest: QuestRowLike };
      return { offer: toOffer(row.offer), quest: toQuest(row.quest) };
    },
  };
}
