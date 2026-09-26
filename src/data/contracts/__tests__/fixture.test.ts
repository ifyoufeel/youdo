/* Formalizes the fixture, doesn't rewrite it: every record in
   adapters/memory/seed.ts — itself a verified extraction of the existing,
   already-Taiwan-renormalized preview/data.taiwan.js (ADR-006) — must
   parse cleanly through the contracts schemas defined from reading that
   exact same source. A schema/data mismatch here means the contract is
   wrong, not the fixture. */
// ADR-004 keeps adapters/* import-only-from-composition-root for *app*
// code; this test is the deliberate exception verifying the contracts
// against the fixture those adapters actually ship, not a real
// composition-root bypass.
// eslint-disable-next-line import/no-restricted-paths
import { seed } from "../../adapters/memory/seed";
import {
  UserSchema,
  QuestSchema,
  OfferSchema,
  ThreadSchema,
  MessageSchema,
  LedgerEntrySchema,
  ReviewSchema,
  NotificationSchema,
  CategorySchema,
  PointSchema,
} from "../index";

describe("every seed record parses through its contract schema", () => {
  it("users", () => {
    const users = Object.values(seed.users);
    expect(users.length).toBeGreaterThan(0);
    for (const u of users) expect(() => UserSchema.parse(u)).not.toThrow();
  });

  it("quests — including every §8 status the fixture models", () => {
    expect(seed.quests.length).toBeGreaterThan(0);
    for (const q of seed.quests) expect(() => QuestSchema.parse(q)).not.toThrow();
    const statuses = new Set(seed.quests.map((q) => q.status));
    // ADR-006/data.taiwan.js's own header claims one entry per legal §8
    // state, but the actual fixture has no `assigned` record — q1 (its
    // one in-flight quest) already carries a startedAt and sits in
    // `in_progress`, so `assigned` (accepted but not yet started) is
    // skipped entirely. Documenting what's really there rather than
    // trusting the header's claim.
    for (const s of ["open", "in_progress", "completed", "paid", "cancelled", "expired"]) {
      expect(statuses.has(s as never)).toBe(true);
    }
    expect(statuses.has("assigned" as never)).toBe(false);
  });

  it("offers — including every offer status", () => {
    expect(seed.offers.length).toBeGreaterThan(0);
    for (const o of seed.offers) expect(() => OfferSchema.parse(o)).not.toThrow();
    const statuses = new Set(seed.offers.map((o) => o.status));
    for (const s of ["pending", "accepted", "declined", "withdrawn"]) {
      expect(statuses.has(s as never)).toBe(true);
    }
  });

  it("threads and their messages", () => {
    expect(seed.threads.length).toBeGreaterThan(0);
    for (const t of seed.threads) expect(() => ThreadSchema.parse(t)).not.toThrow();
    const messageLists = Object.values(seed.messagesByThread);
    expect(messageLists.length).toBeGreaterThan(0);
    for (const list of messageLists) {
      for (const m of list) expect(() => MessageSchema.parse(m)).not.toThrow();
    }
  });

  it("ledger entries — and every txnId's entries sum to zero (ADR-005/PRD §11, checked here too, not just in test/ledger.js)", () => {
    expect(seed.ledger.length).toBeGreaterThan(0);
    for (const e of seed.ledger) expect(() => LedgerEntrySchema.parse(e)).not.toThrow();
    const byTxn = new Map<string, number>();
    for (const e of seed.ledger) byTxn.set(e.txnId, (byTxn.get(e.txnId) ?? 0) + e.amountMinor);
    for (const [, sum] of byTxn) expect(sum).toBe(0);
  });

  it("reviews", () => {
    for (const r of seed.reviews) expect(() => ReviewSchema.parse(r)).not.toThrow();
  });

  it("notifications", () => {
    expect(seed.notifications.length).toBeGreaterThan(0);
    for (const n of seed.notifications) expect(() => NotificationSchema.parse(n)).not.toThrow();
  });

  it("categories", () => {
    expect(seed.categories.length).toBeGreaterThan(0);
    for (const c of seed.categories) {
      if (c.id === "all") continue; // "all" is a UI filter option, not a real category record
      expect(() => CategorySchema.parse(c)).not.toThrow();
    }
  });

  it("areas parse as Points", () => {
    for (const p of Object.values(seed.areas)) expect(() => PointSchema.parse(p)).not.toThrow();
  });
});
