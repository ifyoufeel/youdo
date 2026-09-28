import { planSweep } from "./clock";
import { CONFIRM_WINDOW_MS } from "./lifecycle";
import type { Quest, Offer } from "../contracts";

const NOW = Date.parse("2026-09-16T09:00:00+08:00");

function quest(overrides: Partial<Quest>): Quest {
  return {
    id: "q-test",
    posterId: "p1",
    title: "Test quest",
    payoutMinor: 10000,
    payoutUnit: "fixed",
    categoryId: "delivery",
    point: { x: 0, y: 0 },
    estimatedMinutes: 30,
    durationLabel: null,
    scheduledFor: "2026-09-16T10:00:00+08:00",
    expiresAt: "2026-09-16T09:00:00+08:00",
    createdAt: "2026-09-15T09:00:00+08:00",
    status: "open",
    acceptedOfferId: null,
    addressLine: "addr",
    area: "Da'an",
    details: "details",
    requirements: [],
    ...overrides,
  };
}

function offer(overrides: Partial<Offer>): Offer {
  return {
    id: "o-test",
    questId: "q-test",
    doerId: "d1",
    amountMinor: 10000,
    status: "pending",
    note: "",
    createdAt: "2026-09-15T09:00:00+08:00",
    respondedAt: null,
    ...overrides,
  };
}

describe("planSweep", () => {
  it("expires an open quest whose expiresAt has passed, and plans its pending offers", () => {
    const q = quest({ id: "q1", status: "open", expiresAt: "2026-09-16T08:00:00+08:00" });
    const offers = [
      offer({ id: "o1", questId: "q1", status: "pending" }),
      offer({ id: "o2", questId: "q1", status: "declined" }), // not pending — excluded
    ];
    const plan = planSweep([q], offers, NOW);
    expect(plan.expire).toEqual([{ questId: "q1", pendingOfferIds: ["o1"] }]);
    expect(plan.release).toEqual([]);
  });

  it("does not expire an open quest whose expiresAt is still in the future", () => {
    const q = quest({ id: "q1", status: "open", expiresAt: "2026-09-16T10:00:00+08:00" });
    expect(planSweep([q], [], NOW).expire).toEqual([]);
  });

  it("expires exactly at the boundary (expiresAt === now)", () => {
    const q = quest({ id: "q1", status: "open", expiresAt: new Date(NOW).toISOString() });
    expect(planSweep([q], [], NOW).expire).toEqual([{ questId: "q1", pendingOfferIds: [] }]);
  });

  it("ignores a non-open, non-completed quest regardless of its timestamps", () => {
    const q = quest({ id: "q1", status: "cancelled", expiresAt: "2026-09-01T00:00:00+08:00" });
    const plan = planSweep([q], [], NOW);
    expect(plan.expire).toEqual([]);
    expect(plan.release).toEqual([]);
  });

  it("auto-releases a completed quest once the 72h confirm window has passed, with its accepted offer", () => {
    const completedAt = new Date(NOW - CONFIRM_WINDOW_MS - 1000).toISOString();
    const q = quest({ id: "q1", status: "completed", completedAt, acceptedOfferId: "o1" });
    const offers = [offer({ id: "o1", questId: "q1", status: "accepted" })];
    const plan = planSweep([q], offers, NOW);
    expect(plan.release).toEqual([{ questId: "q1", offerId: "o1" }]);
    expect(plan.expire).toEqual([]);
  });

  it("does not release a completed quest still within the confirm window", () => {
    const completedAt = new Date(NOW - CONFIRM_WINDOW_MS + 1000).toISOString();
    const q = quest({ id: "q1", status: "completed", completedAt, acceptedOfferId: "o1" });
    const offers = [offer({ id: "o1", questId: "q1", status: "accepted" })];
    expect(planSweep([q], offers, NOW).release).toEqual([]);
  });

  it("releases exactly at the boundary (confirmDeadline === now)", () => {
    const completedAt = new Date(NOW - CONFIRM_WINDOW_MS).toISOString();
    const q = quest({ id: "q1", status: "completed", completedAt, acceptedOfferId: "o1" });
    const offers = [offer({ id: "o1", questId: "q1", status: "accepted" })];
    expect(planSweep([q], offers, NOW).release).toEqual([{ questId: "q1", offerId: "o1" }]);
  });

  it("skips a completed quest past the window with no accepted offer", () => {
    const completedAt = new Date(NOW - CONFIRM_WINDOW_MS - 1000).toISOString();
    const q = quest({ id: "q1", status: "completed", completedAt, acceptedOfferId: null });
    expect(planSweep([q], [], NOW).release).toEqual([]);
  });

  it("plans nothing on a second run once everything has already been swept (quests no longer open/completed)", () => {
    const q = quest({ id: "q1", status: "expired", expiresAt: "2026-09-16T08:00:00+08:00" });
    expect(planSweep([q], [], NOW)).toEqual({ expire: [], release: [] });
  });
});
