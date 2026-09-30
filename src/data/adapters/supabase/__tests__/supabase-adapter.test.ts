import { createSupabaseAdapter } from "../index";

describe("supabase adapter stub", () => {
  it("AuthPort's five methods reject with NotImplementedYet('M7') — the only surface left stubbed after Phase 7; every other port is real, covered by its own *.test.ts file (each mocking the client — no live project exists to test against)", async () => {
    const adapter = createSupabaseAdapter();

    const calls: (() => Promise<unknown>)[] = [
      () => adapter.getSession(),
      () => adapter.signInWithGoogle(),
      () => adapter.sendOtp("x", "email"),
      () => adapter.verifyOtp("x", "x"),
      () => adapter.signOut(),
    ];

    for (const call of calls) {
      await expect(call()).rejects.toThrow(/M7/);
    }
  });
});
