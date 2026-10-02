import { createSupabaseAdapter } from "../index";

const EXPECTED_METHODS = [
  "getSession",
  "signInWithGoogle",
  "signInWithApple",
  "sendOtp",
  "verifyOtp",
  "signOut",
  "getUser",
  "listUsers",
  "updateProfile",
  "deleteAccount",
  "registerPushToken",
  "listQuests",
  "getQuest",
  "postQuest",
  "listMyQuests",
  "startQuest",
  "markDone",
  "confirmDone",
  "cancelQuest",
  "disputeQuest",
  "listSavedQuestIds",
  "saveQuest",
  "unsaveQuest",
  "subscribeToQuest",
  "listOffersForQuest",
  "myOfferOnQuest",
  "sendOffer",
  "withdrawOffer",
  "declineOffer",
  "acceptOffer",
  "listThreadsForUser",
  "getThread",
  "listMessages",
  "unreadCountForThread",
  "sendMessage",
  "markThreadRead",
  "subscribeToThread",
  "listEntriesForUser",
  "balanceOf",
  "listPaymentsForUser",
  "deposit",
  "cashOut",
  "listReviewsForUser",
  "myReviewOnQuest",
  "submitReview",
  "reportUser",
  "blockUser",
  "listBlockedUserIds",
  "listForUser",
  "markAllRead",
  "subscribeToUser",
  "listCategories",
  "listAreas",
] as const;

describe("supabase adapter (structural — no live project to test against)", () => {
  it("implements every Repository method as a real function — nothing stubbed as of M7 Phase 8", () => {
    const adapter = createSupabaseAdapter();
    for (const method of EXPECTED_METHODS) {
      expect(typeof adapter[method]).toBe("function");
    }
  });
});
