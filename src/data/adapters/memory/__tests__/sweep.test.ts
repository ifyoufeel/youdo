import { advanceClock } from "../advance-clock";
import { resetClockForTests, nowMs } from "../clock";
import { quests as questStore, offers as offerStore, ledger as ledgerStore, notifications } from "../store";
import { balanceOf } from "../../../domain/ledger";
import { seed } from "../seed";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

describe("advanceClock's sweep, against the real seed", () => {
  afterEach(() => {
    resetClockForTests();
  });

  it("expires stale open quests in two stages, then auto-releases q7's escrow once the confirm window closes", () => {
    // Stage 1: +1d from seed.now (2026-09-17T09:00) expires q4 (10h out)
    // and q2 (exactly 24h, on the boundary) — q6 (28h) and q3 (73h)
    // haven't hit their own boundaries yet.
    advanceClock(DAY_MS);
    expect(nowMs()).toBe(Date.parse(seed.now) + DAY_MS);

    expect(questStore.find((q) => q.id === "q4")!.status).toBe("expired");
    expect(questStore.find((q) => q.id === "q2")!.status).toBe("expired");
    expect(questStore.find((q) => q.id === "q6")!.status).toBe("open");
    expect(questStore.find((q) => q.id === "q3")!.status).toBe("open");

    expect(offerStore.find((o) => o.id === "o2")!.status).toBe("expired"); // q2's pending offer
    expect(offerStore.find((o) => o.id === "o5")!.status).toBe("expired"); // q4's pending offer

    const expiredAfterStage1 = notifications.filter((n) => n.type === "quest_expired");
    expect(expiredAfterStage1.map((n) => n.questId).sort()).toEqual(["q2", "q4"]);

    // Stage 2: two more days (total +3d from seed.now, 2026-09-19T09:00)
    // — q5 (55h) and q6 (28h) now cross their own boundaries; q3 (73h) is
    // still short of the new now, which is 72h past seed.now.
    const feeBefore = balanceOf(ledgerStore, "platform_fee", null);
    const u0HeldBefore = balanceOf(ledgerStore, "user_held", "u0");
    const u5AvailableBefore = balanceOf(ledgerStore, "user_available", "u5");

    advanceClock(2 * DAY_MS);
    expect(nowMs()).toBe(Date.parse(seed.now) + 3 * DAY_MS);

    expect(questStore.find((q) => q.id === "q5")!.status).toBe("expired");
    expect(questStore.find((q) => q.id === "q6")!.status).toBe("expired");
    expect(questStore.find((q) => q.id === "q3")!.status).toBe("open"); // 73h out, still short of 72h
    // Never-open statuses are untouched by the expire half of the sweep.
    expect(questStore.find((q) => q.id === "q1")!.status).toBe("in_progress");
    expect(questStore.find((q) => q.id === "q11")!.status).toBe("assigned");

    // q7: completedAt 2026-09-15T10:02, deadline 2026-09-18T10:02 — well
    // within the new now (2026-09-19T09:00). Real accepted offer o7 (u5,
    // 30000), real held escrow already in the seed.
    const q7 = questStore.find((q) => q.id === "q7")!;
    expect(q7.status).toBe("paid");
    expect(q7.paidAt).toBeTruthy();

    const fee = 3000; // feeOn(30000)
    const net = 27000; // 30000 - fee
    expect(balanceOf(ledgerStore, "user_held", "u0")).toBe(u0HeldBefore - 30000);
    expect(balanceOf(ledgerStore, "user_available", "u5")).toBe(u5AvailableBefore + net);
    expect(balanceOf(ledgerStore, "platform_fee", null)).toBe(feeBefore + fee);

    const autoTxns = ledgerStore.filter((e) => e.txnId.startsWith("tx-auto-"));
    const grouped = new Map<string, number>();
    for (const e of autoTxns) grouped.set(e.txnId, (grouped.get(e.txnId) ?? 0) + e.amountMinor);
    expect([...grouped.values()]).toEqual([0]); // exactly one tx-auto txn, sums to zero

    const paymentNotifs = notifications.filter((n) => n.type === "payment" && n.questId === "q7");
    expect(paymentNotifs.map((n) => n.userId).sort()).toEqual(["u0", "u5"]);

    // Every transaction in the whole ledger, across both sweep stages,
    // still sums to zero.
    const byTxn = new Map<string, number>();
    for (const e of ledgerStore) byTxn.set(e.txnId, (byTxn.get(e.txnId) ?? 0) + e.amountMinor);
    for (const [, sum] of byTxn) expect(sum).toBe(0);
  });
});
