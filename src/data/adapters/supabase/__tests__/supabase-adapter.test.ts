import { createSupabaseAdapter } from "../index";

describe("supabase adapter stub", () => {
  it("every Promise-returning Repository method rejects with NotImplementedYet('M7') — proves the seam, not the backend, and matches the port's real async type", async () => {
    const adapter = createSupabaseAdapter();
    const idempotency = { idempotencyKey: "k" };

    const calls: (() => Promise<unknown>)[] = [
      () => adapter.getSession(),
      () => adapter.signInWithGoogle(),
      () => adapter.sendOtp("x", "email"),
      () => adapter.verifyOtp("x", "x"),
      () => adapter.signOut(),
      () => adapter.getUser("x"),
      () => adapter.listUsers({}),
      () => adapter.updateProfile("x", {}, idempotency),
      () =>
        adapter.listQuests({
          center: { x: 0, y: 0 },
          radiusM: 1,
        }),
      () => adapter.getQuest("x"),
      () => adapter.listOffersForQuest("x"),
      () => adapter.listThreadsForUser("x"),
      () => adapter.listEntriesForUser("x"),
      () => adapter.listReviewsForUser("x"),
      () => adapter.listForUser("x"),
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
