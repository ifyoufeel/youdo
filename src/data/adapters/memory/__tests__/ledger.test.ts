import { createMemoryLedgerPort } from "../ledger";
import { ledger, payments } from "../store";
import { resetIdempotencyForTests } from "../idempotency";
import { setFaultInjectionRate } from "../fault-injection";
import { flushSettlementsForTests } from "../payment-settlement";
import { moveClock, resetClockForTests } from "../clock";

function key(): { idempotencyKey: string } {
  return { idempotencyKey: Math.random().toString(36).slice(2) };
}

describe("memory ledger adapter", () => {
  const port = createMemoryLedgerPort();

  afterEach(() => {
    resetIdempotencyForTests();
    setFaultInjectionRate(0);
    flushSettlementsForTests();
    resetClockForTests();
  });

  describe("listEntriesForUser / balanceOf against the real seed", () => {
    it("matches u0's derived available/held balances", async () => {
      expect(await port.balanceOf("u0", "user_available")).toBe(535500);
      expect(await port.balanceOf("u0", "user_held")).toBe(30000);
    });

    it("listEntriesForUser scopes to the given user only", async () => {
      const entries = await port.listEntriesForUser("u1");
      expect(entries.every((e) => e.userId === "u1")).toBe(true);
      expect(entries.some((e) => e.questId === "q1")).toBe(true);
    });
  });

  describe("deposit", () => {
    it("returns pending immediately, writing no ledger entries until settlement", async () => {
      const before = ledger.length;
      const payment = await port.deposit("u0", 50000, key());
      expect(payment.state).toBe("pending");
      expect(payment.kind).toBe("deposit");
      expect(payment.settledAt).toBeNull();
      expect(ledger.length).toBe(before);

      flushSettlementsForTests();
      const created = ledger.filter((e) => e.txnId === payment.txnId);
      expect(created).toHaveLength(2);
      expect(created.reduce((s, e) => s + e.amountMinor, 0)).toBe(0);
    });

    it("increases available by the deposited amount once settled", async () => {
      const before = await port.balanceOf("u0", "user_available");
      await port.deposit("u0", 20000, key());
      flushSettlementsForTests();
      expect(await port.balanceOf("u0", "user_available")).toBe(before + 20000);
    });

    it("the stored payment record settles to succeeded, distinct from the snapshot the call returned", async () => {
      const snapshot = await port.deposit("u0", 10000, key());
      expect(snapshot.state).toBe("pending");
      flushSettlementsForTests();
      const stored = payments.find((p) => p.id === snapshot.id)!;
      expect(stored.state).toBe("succeeded");
      expect(stored.settledAt).not.toBeNull();
    });

    it("rejects a zero, negative, or non-integer amount synchronously — no payment created", async () => {
      const before = payments.length;
      await expect(port.deposit("u0", 0, key())).rejects.toThrow(/above zero/);
      await expect(port.deposit("u0", -100, key())).rejects.toThrow(/above zero/);
      await expect(port.deposit("u0", 100.5, key())).rejects.toThrow(/above zero/);
      expect(payments.length).toBe(before);
    });

    it("replaying the same idempotency key returns the same payment, not a second one", async () => {
      const k = key();
      const first = await port.deposit("u0", 30000, k);
      const second = await port.deposit("u0", 30000, k);
      expect(second.id).toBe(first.id);
      flushSettlementsForTests();
      const created = ledger.filter((e) => e.txnId === first.txnId);
      expect(created).toHaveLength(2);
    });

    it("settling with fault injection active fails the payment and writes no entries", async () => {
      const payment = await port.deposit("u0", 40000, key());
      setFaultInjectionRate(1);
      flushSettlementsForTests();
      const stored = payments.find((p) => p.id === payment.id)!;
      expect(stored.state).toBe("failed");
      expect(ledger.some((e) => e.txnId === payment.txnId)).toBe(false);
    });
  });

  describe("cashOut", () => {
    it("rejects an amount over what's spendable", async () => {
      const available = await port.balanceOf("u2", "user_available");
      await expect(port.cashOut("u2", available + 1, key())).rejects.toThrow(/available/);
    });

    it("returns pending, then settles with matching entries", async () => {
      const payment = await port.cashOut("u2", 10000, key());
      expect(payment.state).toBe("pending");
      expect(payment.kind).toBe("cashout");
      flushSettlementsForTests();
      const created = ledger.filter((e) => e.txnId === payment.txnId);
      expect(created).toHaveLength(2);
      expect(created.reduce((s, e) => s + e.amountMinor, 0)).toBe(0);
    });

    it("a second cash-out can't exceed what's left once the first is pending", async () => {
      const available = await port.balanceOf("u3", "user_available");
      await port.cashOut("u3", available - 1000, key());
      await expect(port.cashOut("u3", 2000, key())).rejects.toThrow(/available/);
    });

    it("settling with fault injection active fails the payment and writes no entries", async () => {
      const payment = await port.cashOut("u4", 10000, key());
      setFaultInjectionRate(1);
      flushSettlementsForTests();
      const stored = payments.find((p) => p.id === payment.id)!;
      expect(stored.state).toBe("failed");
      expect(ledger.some((e) => e.txnId === payment.txnId)).toBe(false);
    });
  });

  describe("listPaymentsForUser", () => {
    it("returns the user's own payments, newest first", async () => {
      const first = await port.deposit("u5", 10000, key());
      // The memory adapter's clock (M5) is frozen unless moved explicitly
      // — real wall-clock time passing between these two calls wouldn't
      // change nowIso() at all, so advance it directly to give the two
      // payments distinct, orderable timestamps.
      moveClock(1000);
      const second = await port.deposit("u5", 20000, key());
      flushSettlementsForTests();

      const list = await port.listPaymentsForUser("u5");
      expect(list.map((p) => p.id)).toEqual([second.id, first.id]);
      expect(list.every((p) => p.userId === "u5")).toBe(true);
    });
  });
});
