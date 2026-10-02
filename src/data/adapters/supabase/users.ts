/* Real as of M7 (scaffold — never run against a live project). getUser/
   listUsers are plain reads (profiles_select, Phase 1's migration, grants
   every column to any authenticated user — matches the memory adapter's
   own unscoped getUser/listUsers). updateProfile is a direct table
   update too, not an RPC: Phase 1's profiles_update_own policy plus its
   column-scoped grant (name/bio/area/home_x/home_y/phone/email only) is
   already exactly UpdateProfileInput's surface, so there's no guard logic
   an RPC would add — same "no RPC needed" call Phase 1's migration
   comment makes. deleteAccount is the one exception: it touches `bank`,
   which is outside that grant on purpose, so it goes through the
   delete_account() RPC (supabase/migrations/..._users_functions.sql). */
import type { UsersPort, UpdateProfileInput } from "../../ports/users";
import type { User } from "../../contracts";
import { supabase } from "./client";
import type { ProfileRow } from "./database.types";

const DEFAULT_LIMIT = 20;

function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    questsCompleted: row.quests_completed,
    verified: row.verified,
    area: row.area,
    home: { x: row.home_x, y: row.home_y },
    cancelRate: row.cancel_rate,
    bio: row.bio,
    phone: row.phone,
    email: row.email,
    bank: row.bank,
    joined: row.joined,
  };
}

const PROFILE_COLUMNS = "id, name, rating, quests_completed, verified, area, home_x, home_y, cancel_rate, bio, phone, email, bank, joined";

function patchToRow(patch: UpdateProfileInput): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.area !== undefined) row.area = patch.area;
  if (patch.home !== undefined) {
    row.home_x = patch.home.x;
    row.home_y = patch.home.y;
  }
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.email !== undefined) row.email = patch.email;
  return row;
}

export function createSupabaseUsersPort(): UsersPort {
  return {
    async getUser(id) {
      const { data, error } = await supabase().from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? toUser(data as ProfileRow) : null;
    },

    async listUsers(params) {
      const limit = params.limit ?? DEFAULT_LIMIT;
      let query = supabase().from("profiles").select(PROFILE_COLUMNS).order("id").limit(limit + 1);
      if (params.cursor) query = query.gt("id", params.cursor);
      const { data, error } = await query;
      if (error) throw error;
      const rows = (data ?? []) as ProfileRow[];
      const items = rows.slice(0, limit).map(toUser);
      const nextCursor = rows.length > limit ? items[items.length - 1].id : null;
      return { items, nextCursor };
    },

    async updateProfile(userId, patch) {
      const { data, error } = await supabase()
        .from("profiles")
        .update(patchToRow(patch))
        .eq("id", userId)
        .select(PROFILE_COLUMNS)
        .single();
      if (error) throw error;
      return toUser(data as ProfileRow);
    },

    async deleteAccount(_userId, idempotency) {
      const { error } = await supabase().rpc("delete_account", { p_idempotency_key: idempotency.idempotencyKey });
      if (error) throw error;
    },

    async registerPushToken(userId, token) {
      const { error } = await supabase().from("profiles").update({ push_token: token }).eq("id", userId);
      if (error) throw error;
    },
  };
}
