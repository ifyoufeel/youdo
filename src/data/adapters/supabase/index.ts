import type { Repository } from "../../repository";
import { NotImplementedYet } from "../memory/not-implemented";
import { createSupabaseUsersPort } from "./users";
import { createSupabaseCategoriesPort } from "./categories";
import { createSupabaseAreasPort } from "./areas";
import { createSupabaseQuestsPort } from "./quests";
import { createSupabaseOffersPort } from "./offers";
import { createSupabaseLedgerPort } from "./ledger";
import { createSupabaseThreadsPort } from "./threads";
import { createSupabaseNotificationsPort } from "./notifications";

/* Proves the adapter-selection seam in composition-root.tsx actually
   exists (ADR-004) — wiring a real Supabase client, schema and realtime
   channels is M7 work, underway phase by phase (see docs/ROADMAP.md).
   Every method below is a real function (so this object structurally
   satisfies Repository, and the environment-flag selection in
   composition-root.tsx typechecks today); the ones not yet ported fail
   the moment anything actually calls them — as a rejected Promise for
   every Promise-returning port method (so a caller's .catch()/await-try
   still works, matching the port's real type). Every subscribe*()
   method is real as of Phase 6 — the only remaining stubs are
   AuthPort's five methods, Phase 8's job. */
async function stub(method: string): Promise<never> {
  throw new NotImplementedYet(method, "M7");
}

export function createSupabaseAdapter(): Repository {
  const users = createSupabaseUsersPort();
  const categories = createSupabaseCategoriesPort();
  const areas = createSupabaseAreasPort();
  const quests = createSupabaseQuestsPort();
  const offers = createSupabaseOffersPort();
  const ledger = createSupabaseLedgerPort();
  const threads = createSupabaseThreadsPort();
  const notifications = createSupabaseNotificationsPort();

  return {
    getSession: () => stub("getSession"),
    signInWithGoogle: () => stub("signInWithGoogle"),
    sendOtp: () => stub("sendOtp"),
    verifyOtp: () => stub("verifyOtp"),
    signOut: () => stub("signOut"),

    ...users,
    ...quests,
    ...offers,

    ...threads,
    ...ledger,

    listReviewsForUser: () => stub("listReviewsForUser"),
    myReviewOnQuest: () => stub("myReviewOnQuest"),
    submitReview: () => stub("submitReview"),

    reportUser: () => stub("reportUser"),
    blockUser: () => stub("blockUser"),
    listBlockedUserIds: () => stub("listBlockedUserIds"),

    ...notifications,

    ...categories,
    ...areas,
  };
}
