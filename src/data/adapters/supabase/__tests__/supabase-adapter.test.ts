import { createSupabaseAdapter } from "../index";

describe("supabase adapter stub", () => {
  it("every Promise-returning Repository method rejects with NotImplementedYet('M7') — proves the seam, not the backend, and matches the port's real async type", async () => {
    const adapter = createSupabaseAdapter();

    const calls: (() => Promise<unknown>)[] = [
      () => adapter.getSession(),
      () => adapter.signInWithGoogle(),
      () => adapter.sendOtp("x", "email"),
      () => adapter.verifyOtp("x", "x"),
      () => adapter.signOut(),
      () => adapter.startQuest("x", "u", { idempotencyKey: "k" }),
      () => adapter.markDone("x", "u", { idempotencyKey: "k" }),
      () => adapter.confirmDone("x", "u", { idempotencyKey: "k" }),
      () => adapter.cancelQuest("x", "u", "reason", { idempotencyKey: "k" }),
      () => adapter.disputeQuest("x", "u", "reason", { idempotencyKey: "k" }),
      () => adapter.listOffersForQuest("x"),
      () => adapter.listThreadsForUser("x"),
      () => adapter.listEntriesForUser("x"),
      () => adapter.listPaymentsForUser("x"),
      () => adapter.listReviewsForUser("x"),
      () => adapter.listForUser("x"),
      // getUser/listUsers/updateProfile/deleteAccount/listCategories/
      // listAreas are real as of M7 Phase 2, listQuests/getQuest/
      // postQuest/listMyQuests/listSavedQuestIds/saveQuest/unsaveQuest
      // as of Phase 3 — covered by their own *.test.ts files instead.
    ];

    for (const call of calls) {
      await expect(call()).rejects.toThrow(/M7/);
    }
  });

  it("the subscribe*() methods still stubbed by Phase 3 throw synchronously — subscribeToQuest is real (a typed no-op) as of Phase 3, tested in quests.test.ts", () => {
    const adapter = createSupabaseAdapter();
    expect(() => adapter.subscribeToThread("x", () => {})).toThrow(/M7/);
    expect(() => adapter.subscribeToUser("x", () => {})).toThrow(/M7/);
  });
});
