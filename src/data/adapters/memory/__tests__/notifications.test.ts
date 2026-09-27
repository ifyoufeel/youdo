import { createMemoryNotificationsPort } from "../notifications";
import { resetIdempotencyForTests } from "../idempotency";
import { setFaultInjectionRate } from "../fault-injection";

function key(): { idempotencyKey: string } {
  return { idempotencyKey: Math.random().toString(36).slice(2) };
}

describe("memory notifications adapter", () => {
  const port = createMemoryNotificationsPort();

  afterEach(() => {
    resetIdempotencyForTests();
    setFaultInjectionRate(0);
  });

  describe("listForUser", () => {
    it("returns only u0's seeded notifications, newest first", async () => {
      const list = await port.listForUser("u0");
      expect(list.map((n) => n.id)).toEqual(["n4", "n2", "n1", "n3", "n5"]);
    });

    it("scopes to the given user — u1's own notification never leaks into u0's list", async () => {
      const list = await port.listForUser("u0");
      expect(list.some((n) => n.id === "n6")).toBe(false);
    });

    it("returns an empty list for a user with none", async () => {
      expect(await port.listForUser("u-nobody")).toEqual([]);
    });

    it("honors the fault-injection switch", async () => {
      setFaultInjectionRate(1);
      await expect(port.listForUser("u0")).rejects.toThrow(/Injected fault/);
    });
  });

  describe("markAllRead", () => {
    it("marks every currently-unread notification for that user as read, leaving others untouched", async () => {
      await port.markAllRead("u0", key());
      const list = await port.listForUser("u0");
      expect(list.every((n) => n.readAt !== null)).toBe(true);

      const u1List = await port.listForUser("u1");
      expect(u1List.find((n) => n.id === "n6")?.readAt).toBeNull();
    });

    it("replaying the same idempotency key is a no-op the second time", async () => {
      const k = key();
      await port.markAllRead("u0", k);
      const firstReadAts = (await port.listForUser("u0")).map((n) => n.readAt);
      await port.markAllRead("u0", k);
      const secondReadAts = (await port.listForUser("u0")).map((n) => n.readAt);
      expect(secondReadAts).toEqual(firstReadAts);
    });
  });
});
