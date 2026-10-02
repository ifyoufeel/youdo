import { setFaultInjectionRate } from "../fault-injection";
import { resetIdempotencyForTests } from "../idempotency";
import { createMemoryAdapter } from "../index";
import { quests as questsStore, pushTokens } from "../store";
import { nowIso, nowMs } from "../clock";
import { seed } from "../seed";
import { InvalidOtpError } from "../../../ports/auth";
import { distanceBetween } from "../../../contracts";

describe("memory adapter — real slice", () => {
  afterEach(() => {
    setFaultInjectionRate(0);
    resetIdempotencyForTests();
  });

  describe("auth", () => {
    it("starts signed out, signs in, and signs out — scoped to its own instance", async () => {
      const adapter = createMemoryAdapter();
      expect(await adapter.getSession()).toBeNull();

      const session = await adapter.signInWithGoogle();
      expect(session.userId).toBe(seed.meId);
      expect(await adapter.getSession()).toEqual(session);

      await adapter.signOut();
      expect(await adapter.getSession()).toBeNull();
    });

    it("signInWithApple signs in the same seeded identity as signInWithGoogle", async () => {
      const adapter = createMemoryAdapter();
      const session = await adapter.signInWithApple();
      expect(session.userId).toBe(seed.meId);
      expect(await adapter.getSession()).toEqual(session);
    });

    it("verifyOtp signs in the same way, independent of a second instance", async () => {
      const a = createMemoryAdapter();
      const b = createMemoryAdapter();
      await a.verifyOtp("alex@example.tw", "123456");
      expect(await a.getSession()).toEqual({ userId: seed.meId });
      expect(await b.getSession()).toBeNull();
    });

    it("verifyOtp('000000') throws InvalidOtpError — the prototype's one deliberately-wrong code, now real", async () => {
      const adapter = createMemoryAdapter();
      await expect(adapter.verifyOtp("alex@example.tw", "000000")).rejects.toBeInstanceOf(InvalidOtpError);
      // The failed attempt must not have signed anything in.
      expect(await adapter.getSession()).toBeNull();
    });

    it("sendOtp resolves without throwing (mock — nothing is actually sent)", async () => {
      const adapter = createMemoryAdapter();
      await expect(adapter.sendOtp("alex@example.tw", "email")).resolves.toBeUndefined();
    });
  });

  describe("users", () => {
    it("getUser returns a seeded user parsed through UserSchema", async () => {
      const adapter = createMemoryAdapter();
      const user = await adapter.getUser(seed.meId);
      expect(user?.id).toBe(seed.meId);
      expect(user?.name).toBe(seed.users[seed.meId as keyof typeof seed.users].name);
    });

    it("getUser returns null for an unknown id", async () => {
      const adapter = createMemoryAdapter();
      expect(await adapter.getUser("no-such-user")).toBeNull();
    });

    it("listUsers paginates the full seeded set", async () => {
      const adapter = createMemoryAdapter();
      const page = await adapter.listUsers({ limit: 2 });
      expect(page.items).toHaveLength(2);
      expect(page.nextCursor).not.toBeNull();
    });

    it("updateProfile patches and persists the change", async () => {
      const adapter = createMemoryAdapter();
      const updated = await adapter.updateProfile(seed.meId, { bio: "Updated via test." }, { idempotencyKey: "k1" });
      expect(updated.bio).toBe("Updated via test.");
      const reread = await adapter.getUser(seed.meId);
      expect(reread?.bio).toBe("Updated via test.");
    });

    it("updateProfile throws for an unknown user", async () => {
      const adapter = createMemoryAdapter();
      await expect(
        adapter.updateProfile("no-such-user", { bio: "x" }, { idempotencyKey: "k2" })
      ).rejects.toThrow();
    });

    it("deleteAccount anonymizes the PII fields, leaving everything else (rating, area, id) untouched", async () => {
      const adapter = createMemoryAdapter();
      const before = await adapter.getUser("u3");
      await adapter.deleteAccount("u3", { idempotencyKey: "del-1" });
      const after = await adapter.getUser("u3");
      expect(after?.name).toBe("Deleted user");
      expect(after?.bio).toBe("");
      expect(after?.phone).toBe("");
      expect(after?.email).toBe("");
      expect(after?.bank).toBe("");
      expect(after?.id).toBe(before?.id);
      expect(after?.rating).toBe(before?.rating);
      expect(after?.area).toBe(before?.area);
    });

    it("deleteAccount throws for an unknown user", async () => {
      const adapter = createMemoryAdapter();
      await expect(adapter.deleteAccount("no-such-user", { idempotencyKey: "del-2" })).rejects.toThrow();
    });

    it("registerPushToken sets a token, and null clears it — never surfaced through getUser", async () => {
      const adapter = createMemoryAdapter();
      await adapter.registerPushToken("u3", "ExponentPushToken[abc]");
      expect(pushTokens.get("u3")).toBe("ExponentPushToken[abc]");
      expect(await adapter.getUser("u3")).not.toHaveProperty("pushToken");

      await adapter.registerPushToken("u3", null);
      expect(pushTokens.has("u3")).toBe(false);
    });

    it("deleteAccount also clears avatarUrl, same PII treatment as name/bio/phone/email/bank", async () => {
      const adapter = createMemoryAdapter();
      await adapter.updateProfile("u4", { avatarUrl: "file:///tmp/photo.jpg" }, { idempotencyKey: "av-1" });
      await adapter.deleteAccount("u4", { idempotencyKey: "del-3" });
      expect((await adapter.getUser("u4"))?.avatarUrl).toBeNull();
    });

    it("uploadPhoto returns the local URI unchanged — there's no server to round-trip through", async () => {
      const adapter = createMemoryAdapter();
      const url = await adapter.uploadPhoto("file:///tmp/photo.jpg", "avatar");
      expect(url).toBe("file:///tmp/photo.jpg");
    });
  });

  describe("quests", () => {
    it("getQuest returns a seeded quest parsed through QuestSchema", async () => {
      const adapter = createMemoryAdapter();
      const quest = await adapter.getQuest("q1");
      expect(quest?.title).toBe("Walk Biscuit for an hour");
    });

    it("getQuest returns null for an unknown id", async () => {
      const adapter = createMemoryAdapter();
      expect(await adapter.getQuest("no-such-quest")).toBeNull();
    });

    it("listQuests only returns status \"open\" quests — the browse feed, not a per-user activity list", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const page = await adapter.listQuests({ center: me.home, radiusM: 1_000_000, limit: 100 });
      expect(page.items.length).toBeGreaterThan(0);
      expect(page.items.every((q) => q.status === "open")).toBe(true);
      // q1 (in_progress) and q7 (completed) exist in the fixture but must
      // never surface in the open marketplace feed.
      expect(page.items.some((q) => q.id === "q1" || q.id === "q7")).toBe(false);
    });

    it("listQuests filters by radius", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const near = await adapter.listQuests({ center: me.home, radiusM: 1000, limit: 100 });
      expect(near.items.some((q) => q.id === "q5")).toBe(true);

      // q5 (status "open") is genuinely far from u0's home (~550m); a
      // radius short of that must exclude it, while a quest sitting
      // exactly at u0's own home (q6, u0's own posting) stays included at
      // any radius.
      const tight = await adapter.listQuests({ center: me.home, radiusM: 100, limit: 100 });
      expect(tight.items.some((q) => q.id === "q5")).toBe(false);
      expect(tight.items.some((q) => q.id === "q6")).toBe(true);
    });

    it("listQuests filters by categoryId", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const page = await adapter.listQuests({
        center: me.home,
        radiusM: 1_000_000,
        categoryId: "delivery",
        limit: 100,
      });
      expect(page.items.map((q) => q.id).sort()).toEqual(["q2", "q6"]);
      expect(page.items.every((q) => q.categoryId === "delivery")).toBe(true);
    });

    it("listQuests filters by search text against title/details", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const page = await adapter.listQuests({
        center: me.home,
        radiusM: 1_000_000,
        search: "wardrobe",
        limit: 100,
      });
      expect(page.items.map((q) => q.id)).toEqual(["q3"]);
    });

    it("listQuests filters by verifiedPostersOnly", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const page = await adapter.listQuests({
        center: me.home,
        radiusM: 1_000_000,
        verifiedPostersOnly: true,
        limit: 100,
      });
      // Open quests posted by a verified user: q3 (u3), q5 (u5), q6 (u0).
      expect(page.items.map((q) => q.id).sort()).toEqual(["q3", "q5", "q6"]);
    });

    it("listQuests filters by todayOnly", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      // The fixture's own quests are all dated relative to seed.now, and
      // the memory adapter's clock (M5) is anchored there too, not the
      // device clock — so "today" means the seed's own today, not
      // whenever this test happens to run. q4 (scheduledFor 2026-09-16,
      // the same day as seed.now) already qualifies; this synthetic quest
      // exists to prove the filter is real, not just an accident of one
      // seeded quest's date.
      const todayQuest = {
        id: "test-today-quest",
        posterId: "u0",
        title: "Synthetic today quest",
        payoutMinor: 10000,
        payoutUnit: "fixed" as const,
        categoryId: "delivery",
        point: me.home,
        estimatedMinutes: 30,
        durationLabel: null,
        scheduledFor: nowIso(),
        expiresAt: new Date(nowMs() + 86_400_000).toISOString(),
        createdAt: nowIso(),
        status: "open" as const,
        acceptedOfferId: null,
        addressLine: "Test address",
        area: "Da'an",
        details: "Test details",
        requirements: [],
        photos: [],
      };
      questsStore.push(todayQuest);
      try {
        const page = await adapter.listQuests({
          center: me.home,
          radiusM: 1_000_000,
          todayOnly: true,
          limit: 100,
        });
        // q4 is also open and scheduled on the seed's own "today" —
        // both it and the synthetic quest should match.
        expect(page.items.map((q) => q.id).sort()).toEqual(["q4", "test-today-quest"]);
      } finally {
        questsStore.pop();
      }
    });

    it("listQuests sorts by pay (descending)", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const page = await adapter.listQuests({ center: me.home, radiusM: 1_000_000, sort: "pay", limit: 100 });
      const amounts = page.items.map((q) => q.payoutMinor);
      expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
    });

    it("listQuests sorts by ending (expiresAt ascending)", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const page = await adapter.listQuests({ center: me.home, radiusM: 1_000_000, sort: "ending", limit: 100 });
      const expires = page.items.map((q) => Date.parse(q.expiresAt));
      expect(expires).toEqual([...expires].sort((a, b) => a - b));
    });

    it("listQuests sorts by newest (createdAt descending)", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const page = await adapter.listQuests({ center: me.home, radiusM: 1_000_000, sort: "newest", limit: 100 });
      const created = page.items.map((q) => Date.parse(q.createdAt));
      expect(created).toEqual([...created].sort((a, b) => b - a));
    });

    it("listQuests defaults to closest (distance ascending) when sort is omitted", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const page = await adapter.listQuests({ center: me.home, radiusM: 1_000_000, limit: 100 });
      const distances = page.items.map((q) => distanceBetween(q.point, me.home));
      expect(distances).toEqual([...distances].sort((a, b) => a - b));
    });

    it("subscribeToQuest returns a typed no-op subscription", async () => {
      const adapter = createMemoryAdapter();
      const sub = adapter.subscribeToQuest("q1", () => {});
      expect(() => sub.unsubscribe()).not.toThrow();
    });
  });

  describe("saved quests", () => {
    it("listSavedQuestIds starts from the seeded savedByUser set", async () => {
      const adapter = createMemoryAdapter();
      expect(await adapter.listSavedQuestIds(seed.meId)).toEqual(["q4"]);
    });

    it("saveQuest adds and unsaveQuest removes, for real", async () => {
      const adapter = createMemoryAdapter();
      await adapter.saveQuest(seed.meId, "q2", { idempotencyKey: "save-q2" });
      expect(await adapter.listSavedQuestIds(seed.meId)).toEqual(expect.arrayContaining(["q4", "q2"]));

      await adapter.unsaveQuest(seed.meId, "q4", { idempotencyKey: "unsave-q4" });
      const saved = await adapter.listSavedQuestIds(seed.meId);
      expect(saved).toContain("q2");
      expect(saved).not.toContain("q4");
    });

    it("saveQuest is idempotent — a replayed key is a no-op", async () => {
      const adapter = createMemoryAdapter();
      await adapter.saveQuest(seed.meId, "q2", { idempotencyKey: "dup" });
      // Same key, different quest — must be ignored, not applied.
      await adapter.saveQuest(seed.meId, "q3", { idempotencyKey: "dup" });
      const saved = await adapter.listSavedQuestIds(seed.meId);
      expect(saved).toContain("q2");
      expect(saved).not.toContain("q3");
    });
  });

  describe("fault injection propagates through real port methods", () => {
    it("a real read throws once the rate is 1", async () => {
      const adapter = createMemoryAdapter();
      setFaultInjectionRate(1);
      await expect(adapter.getUser(seed.meId)).rejects.toThrow(/Injected fault/);
    });
  });

  describe("no stubbed methods remain", () => {
    it("resolves rather than throwing NotImplementedYet — disputeQuest, ReviewsPort, and TrustPort (all M6) were the last ones", async () => {
      const adapter = createMemoryAdapter();
      // disputeQuest is real as of M6 Phase 0 (src/data/adapters/memory/
      // __tests__/quests.test.ts covers its own guards) — the resolution
      // half (disputed->paid/cancelled) stays permanently unreachable,
      // no admin actor exists, but filing one is poster-only and real.
      // Threads/notifications real since M4 Phase 1, LedgerPort since M5
      // Phase 2, ReviewsPort since M6 Phase 0
      // (src/data/adapters/memory/__tests__/reviews.test.ts covers it),
      // TrustPort since M6 Phase 3 — every port method in this adapter is
      // real now.
      expect(await adapter.listEntriesForUser(seed.meId)).toEqual(
        expect.arrayContaining([expect.objectContaining({ userId: seed.meId })])
      );
      // listReviewsForUser now applies the reveal rule server-side (M6
      // Phase 3), so it can legitimately resolve empty for a real user
      // with an unrevealed review pending — the call resolving at all,
      // without throwing NotImplementedYet, is what this test checks.
      expect(await adapter.listReviewsForUser(seed.meId)).toEqual([]);
      expect(await adapter.listBlockedUserIds(seed.meId)).toEqual([]);
    });
  });
});
