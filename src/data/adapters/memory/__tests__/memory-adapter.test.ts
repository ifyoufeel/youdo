import { setFaultInjectionRate } from "../fault-injection";
import { createMemoryAdapter } from "../index";
import { seed } from "../seed";

describe("memory adapter — real slice", () => {
  afterEach(() => {
    setFaultInjectionRate(0);
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

    it("verifyOtp signs in the same way, independent of a second instance", async () => {
      const a = createMemoryAdapter();
      const b = createMemoryAdapter();
      await a.verifyOtp("alex@example.tw", "000000");
      expect(await a.getSession()).toEqual({ userId: seed.meId });
      expect(await b.getSession()).toBeNull();
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

    it("listQuests filters by radius", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const near = await adapter.listQuests({ center: me.home, radiusM: 1000, limit: 100 });
      expect(near.items.some((q) => q.id === "q1")).toBe(true);

      // q1 is genuinely far from u0's home (~700m); a radius short of that
      // must exclude it, while a quest sitting exactly at u0's own home
      // (q6/q7 — u0's own postings) stays included at any radius.
      const tight = await adapter.listQuests({ center: me.home, radiusM: 100, limit: 100 });
      expect(tight.items.some((q) => q.id === "q1")).toBe(false);
    });

    it("listQuests filters by categoryId", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const page = await adapter.listQuests({
        center: me.home,
        radiusM: 1_000_000,
        categoryId: "dog-walking",
        limit: 100,
      });
      expect(page.items.length).toBeGreaterThan(0);
      expect(page.items.every((q) => q.categoryId === "dog-walking")).toBe(true);
    });

    it("listQuests filters by search text against title/details", async () => {
      const adapter = createMemoryAdapter();
      const me = seed.users[seed.meId as keyof typeof seed.users];
      const page = await adapter.listQuests({
        center: me.home,
        radiusM: 1_000_000,
        search: "biscuit",
        limit: 100,
      });
      expect(page.items.map((q) => q.id)).toEqual(["q1"]);
    });

    it("subscribeToQuest returns a typed no-op subscription", async () => {
      const adapter = createMemoryAdapter();
      const sub = adapter.subscribeToQuest("q1", () => {});
      expect(() => sub.unsubscribe()).not.toThrow();
    });
  });

  describe("fault injection propagates through real port methods", () => {
    it("a real read throws once the rate is 1", async () => {
      const adapter = createMemoryAdapter();
      setFaultInjectionRate(1);
      await expect(adapter.getUser(seed.meId)).rejects.toThrow(/Injected fault/);
    });
  });

  describe("stubbed methods", () => {
    it("throw NotImplementedYet, not silently no-op", async () => {
      const adapter = createMemoryAdapter();
      await expect(
        adapter.postQuest(
          {
            posterId: seed.meId,
            title: "x",
            details: "x",
            categoryId: "dog-walking",
            payoutMinor: 1,
            estimatedMinutes: 1,
            addressLine: "x",
            area: "Da'an",
            point: { x: 0, y: 0 },
            scheduledFor: "2026-01-01T00:00:00+08:00",
            expiresAt: "2026-01-01T00:00:00+08:00",
            requirements: [],
          },
          { idempotencyKey: "k" }
        )
      ).rejects.toThrow(/not implemented yet/);

      await expect(adapter.sendOffer("q1", seed.meId, 1, "x", { idempotencyKey: "k" })).rejects.toThrow(
        /not implemented yet/
      );
      await expect(adapter.listThreadsForUser(seed.meId)).rejects.toThrow(/not implemented yet/);
      await expect(adapter.listEntriesForUser(seed.meId)).rejects.toThrow(/not implemented yet/);
      await expect(adapter.listReviewsForUser(seed.meId)).rejects.toThrow(/not implemented yet/);
      await expect(adapter.listForUser(seed.meId)).rejects.toThrow(/not implemented yet/);
    });
  });
});
