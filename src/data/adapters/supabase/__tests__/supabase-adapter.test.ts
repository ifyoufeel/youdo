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
      () =>
        adapter.listQuests({
          center: { x: 0, y: 0 },
          radiusM: 1,
        }),
      () => adapter.getQuest("x"),
      () => adapter.listOffersForQuest("x"),
      () => adapter.listThreadsForUser("x"),
      () => adapter.listEntriesForUser("x"),
      () => adapter.listPaymentsForUser("x"),
      () => adapter.listReviewsForUser("x"),
      () => adapter.listForUser("x"),
      // getUser/listUsers/updateProfile/deleteAccount/listCategories/
      // listAreas are real as of M7 Phase 2 — covered by
      // users.test.ts/categories.test.ts/areas.test.ts instead.
    ];

    for (const call of calls) {
      await expect(call()).rejects.toThrow(/M7/);
    }
  });

  it("the subscribe*() methods throw synchronously, matching their non-Promise Subscription return type", () => {
    const adapter = createSupabaseAdapter();
    expect(() => adapter.subscribeToQuest("x", () => {})).toThrow(/M7/);
    expect(() => adapter.subscribeToThread("x", () => {})).toThrow(/M7/);
    expect(() => adapter.subscribeToUser("x", () => {})).toThrow(/M7/);
  });
});
