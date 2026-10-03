import { createMemoryTrustPort } from "../trust";
import { resetIdempotencyForTests } from "../idempotency";
import { setFaultInjectionRate } from "../fault-injection";

function key(): { idempotencyKey: string } {
  return { idempotencyKey: Math.random().toString(36).slice(2) };
}

describe("memory trust adapter", () => {
  const port = createMemoryTrustPort();

  afterEach(() => {
    resetIdempotencyForTests();
    setFaultInjectionRate(0);
  });

  describe("reportUser", () => {
    it("creates a real report with the given shape", async () => {
      const report = await port.reportUser("u0", "u2", "They didn't turn up", key());
      expect(report.reporterId).toBe("u0");
      expect(report.targetUserId).toBe("u2");
      expect(report.reason).toBe("They didn't turn up");
      expect(report.id).toBeTruthy();
      expect(report.at).toBeTruthy();
    });

    it("rejects reporting yourself", async () => {
      await expect(port.reportUser("u0", "u0", "reason", key())).rejects.toThrow(/report yourself/);
    });

    it("requires a non-empty reason", async () => {
      await expect(port.reportUser("u0", "u2", "  ", key())).rejects.toThrow(/Say what happened/);
    });

    it("replays idempotently rather than creating a second report", async () => {
      const k = key();
      const first = await port.reportUser("u0", "u2", "reason", k);
      const second = await port.reportUser("u0", "u2", "reason", k);
      expect(second.id).toBe(first.id);
    });
  });

  describe("blockUser / listBlockedUserIds", () => {
    it("blocks a user and lists them back", async () => {
      await port.blockUser("u1", "u5", key());
      expect(await port.listBlockedUserIds("u1")).toContain("u5");
    });

    it("rejects blocking yourself", async () => {
      await expect(port.blockUser("u1", "u1", key())).rejects.toThrow(/block yourself/);
    });

    it("is idempotent — blocking twice doesn't duplicate the entry", async () => {
      await port.blockUser("u3", "u6", key());
      await port.blockUser("u3", "u6", key());
      const blocked = await port.listBlockedUserIds("u3");
      expect(blocked.filter((id) => id === "u6")).toHaveLength(1);
    });

    it("returns an empty list for a user who hasn't blocked anyone", async () => {
      expect(await port.listBlockedUserIds("u9")).toEqual([]);
    });
  });
});
