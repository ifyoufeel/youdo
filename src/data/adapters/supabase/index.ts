import type { Repository } from "../../repository";
import { createSupabaseAuthPort } from "./auth";
import { createSupabaseUsersPort } from "./users";
import { createSupabaseCategoriesPort } from "./categories";
import { createSupabaseAreasPort } from "./areas";
import { createSupabaseQuestsPort } from "./quests";
import { createSupabaseOffersPort } from "./offers";
import { createSupabaseLedgerPort } from "./ledger";
import { createSupabaseThreadsPort } from "./threads";
import { createSupabaseNotificationsPort } from "./notifications";
import { createSupabaseReviewsPort } from "./reviews";
import { createSupabaseTrustPort } from "./trust";

/* Proves the adapter-selection seam in composition-root.tsx actually
   exists (ADR-004) — a real Supabase client, schema, RLS, RPCs and
   realtime channels, built phase by phase across M7 (see
   docs/ROADMAP.md). Every port is real as of Phase 8 — nothing left
   stubbed. Still scaffold-only in the sense that matters: none of it has
   ever been run against a live Supabase project (the user's own explicit
   scope for this milestone). Each adapters/supabase/*.ts file's own
   header comment says so, and Phase 9's docs record it project-wide. */
export function createSupabaseAdapter(): Repository {
  return {
    ...createSupabaseAuthPort(),
    ...createSupabaseUsersPort(),
    ...createSupabaseQuestsPort(),
    ...createSupabaseOffersPort(),
    ...createSupabaseThreadsPort(),
    ...createSupabaseLedgerPort(),
    ...createSupabaseReviewsPort(),
    ...createSupabaseTrustPort(),
    ...createSupabaseNotificationsPort(),
    ...createSupabaseCategoriesPort(),
    ...createSupabaseAreasPort(),
  };
}
