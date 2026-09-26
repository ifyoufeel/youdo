import type { Repository } from "../../repository";
import { NotImplementedYet } from "../memory/not-implemented";

/* Proves the adapter-selection seam in composition-root.tsx actually
   exists (ADR-004) — wiring a real Supabase client, schema and realtime
   channels is M7 work. Every method below is a real function (so this
   object structurally satisfies Repository, and the environment-flag
   selection in composition-root.tsx typechecks today) that fails the
   moment anything actually calls it — as a rejected Promise for every
   Promise-returning port method (so a caller's .catch()/await-try still
   works, matching the port's real type), and only thrown synchronously
   for the handful of subscribe*() methods whose port signature returns a
   Subscription directly, never a Promise. */
async function stub(method: string): Promise<never> {
  throw new NotImplementedYet(method, "M7");
}

function stubSync(method: string): never {
  throw new NotImplementedYet(method, "M7");
}

export function createSupabaseAdapter(): Repository {
  return {
    getSession: () => stub("getSession"),
    signInWithGoogle: () => stub("signInWithGoogle"),
    sendOtp: () => stub("sendOtp"),
    verifyOtp: () => stub("verifyOtp"),
    signOut: () => stub("signOut"),

    getUser: () => stub("getUser"),
    listUsers: () => stub("listUsers"),
    updateProfile: () => stub("updateProfile"),

    listQuests: () => stub("listQuests"),
    getQuest: () => stub("getQuest"),
    postQuest: () => stub("postQuest"),
    startQuest: () => stub("startQuest"),
    markDone: () => stub("markDone"),
    confirmDone: () => stub("confirmDone"),
    cancelQuest: () => stub("cancelQuest"),
    disputeQuest: () => stub("disputeQuest"),
    listSavedQuestIds: () => stub("listSavedQuestIds"),
    saveQuest: () => stub("saveQuest"),
    unsaveQuest: () => stub("unsaveQuest"),
    subscribeToQuest: () => stubSync("subscribeToQuest"),

    listOffersForQuest: () => stub("listOffersForQuest"),
    myOfferOnQuest: () => stub("myOfferOnQuest"),
    sendOffer: () => stub("sendOffer"),
    withdrawOffer: () => stub("withdrawOffer"),
    declineOffer: () => stub("declineOffer"),
    acceptOffer: () => stub("acceptOffer"),

    listThreadsForUser: () => stub("listThreadsForUser"),
    getThread: () => stub("getThread"),
    listMessages: () => stub("listMessages"),
    sendMessage: () => stub("sendMessage"),
    markThreadRead: () => stub("markThreadRead"),
    subscribeToThread: () => stubSync("subscribeToThread"),

    listEntriesForUser: () => stub("listEntriesForUser"),
    balanceOf: () => stub("balanceOf"),
    deposit: () => stub("deposit"),
    cashOut: () => stub("cashOut"),

    listReviewsForUser: () => stub("listReviewsForUser"),
    myReviewOnQuest: () => stub("myReviewOnQuest"),
    submitReview: () => stub("submitReview"),

    listForUser: () => stub("listForUser"),
    markAllRead: () => stub("markAllRead"),
    subscribeToUser: () => stubSync("subscribeToUser"),

    listCategories: () => stub("listCategories"),
  };
}
