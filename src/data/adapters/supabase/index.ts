import type { Repository } from "../../repository";
import { NotImplementedYet } from "../memory/not-implemented";
import { createSupabaseUsersPort } from "./users";
import { createSupabaseCategoriesPort } from "./categories";
import { createSupabaseAreasPort } from "./areas";
import { createSupabaseQuestsPort } from "./quests";
import { createSupabaseOffersPort } from "./offers";
import { createSupabaseLedgerPort } from "./ledger";

/* Proves the adapter-selection seam in composition-root.tsx actually
   exists (ADR-004) — wiring a real Supabase client, schema and realtime
   channels is M7 work, underway phase by phase (see docs/ROADMAP.md).
   Every method below is a real function (so this object structurally
   satisfies Repository, and the environment-flag selection in
   composition-root.tsx typechecks today); the ones not yet ported fail
   the moment anything actually calls them — as a rejected Promise for
   every Promise-returning port method (so a caller's .catch()/await-try
   still works, matching the port's real type), and only thrown
   synchronously for the handful of subscribe*() methods whose port
   signature returns a Subscription directly, never a Promise. */
async function stub(method: string): Promise<never> {
  throw new NotImplementedYet(method, "M7");
}

function stubSync(method: string): never {
  throw new NotImplementedYet(method, "M7");
}

export function createSupabaseAdapter(): Repository {
  const users = createSupabaseUsersPort();
  const categories = createSupabaseCategoriesPort();
  const areas = createSupabaseAreasPort();
  const quests = createSupabaseQuestsPort();
  const offers = createSupabaseOffersPort();
  const ledger = createSupabaseLedgerPort();

  return {
    getSession: () => stub("getSession"),
    signInWithGoogle: () => stub("signInWithGoogle"),
    sendOtp: () => stub("sendOtp"),
    verifyOtp: () => stub("verifyOtp"),
    signOut: () => stub("signOut"),

    ...users,
    ...quests,
    ...offers,

    listThreadsForUser: () => stub("listThreadsForUser"),
    getThread: () => stub("getThread"),
    listMessages: () => stub("listMessages"),
    unreadCountForThread: () => stub("unreadCountForThread"),
    sendMessage: () => stub("sendMessage"),
    markThreadRead: () => stub("markThreadRead"),
    subscribeToThread: () => stubSync("subscribeToThread"),

    ...ledger,

    listReviewsForUser: () => stub("listReviewsForUser"),
    myReviewOnQuest: () => stub("myReviewOnQuest"),
    submitReview: () => stub("submitReview"),

    reportUser: () => stub("reportUser"),
    blockUser: () => stub("blockUser"),
    listBlockedUserIds: () => stub("listBlockedUserIds"),

    listForUser: () => stub("listForUser"),
    markAllRead: () => stub("markAllRead"),
    subscribeToUser: () => stubSync("subscribeToUser"),

    ...categories,
    ...areas,
  };
}
