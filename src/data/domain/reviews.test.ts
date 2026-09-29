import { reviewsOf, myReviewOn, reviewVisible, canRate, REVIEW_REVEAL_MS } from "./reviews";
import type { Quest, Review } from "../contracts";

const NOW = Date.parse("2026-09-16T09:00:00+08:00");

function review(overrides: Partial<Review> = {}): Review {
  return {
    id: "r1",
    questId: "q1",
    raterId: "u2",
    rateeId: "u0",
    rating: 5,
    comment: "",
    at: "2026-09-13T12:30:00+08:00",
    ...overrides,
  };
}

function quest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: "q1",
    posterId: "u1",
    title: "Walk Biscuit for an hour",
    payoutMinor: 40000,
    payoutUnit: "fixed",
    categoryId: "dog-walking",
    point: { x: 0, y: 0 },
    estimatedMinutes: 60,
    durationLabel: null,
    scheduledFor: "2026-09-16T18:00:00+08:00",
    expiresAt: "2026-09-16T17:00:00+08:00",
    createdAt: "2026-09-15T20:10:00+08:00",
    status: "paid",
    acceptedOfferId: "o1",
    addressLine: "14B, Lane 31, Yongkang St",
    area: "Da'an",
    details: "",
    requirements: [],
    ...overrides,
  };
}

describe("reviewsOf", () => {
  it("returns reviews where the given user is the ratee, not the rater", () => {
    const reviews = [review({ id: "r1", rateeId: "u0" }), review({ id: "r2", rateeId: "u1", raterId: "u0" })];
    expect(reviewsOf(reviews, "u0").map((r) => r.id)).toEqual(["r1"]);
  });
});

describe("myReviewOn", () => {
  it("finds a review by (questId, raterId)", () => {
    const reviews = [review({ id: "r1", questId: "q8", raterId: "u2" })];
    expect(myReviewOn(reviews, "q8", "u2")?.id).toBe("r1");
  });

  it("returns null when this rater hasn't reviewed this quest", () => {
    const reviews = [review({ id: "r1", questId: "q8", raterId: "u2" })];
    expect(myReviewOn(reviews, "q8", "u0")).toBeNull();
  });
});

describe("reviewVisible", () => {
  it("is visible once the ratee has rated the rater back on the same quest, however recently", () => {
    const r1 = review({ id: "r1", questId: "q8", raterId: "u2", rateeId: "u0", at: "2026-09-16T08:59:00+08:00" });
    const back = review({ id: "r2", questId: "q8", raterId: "u0", rateeId: "u2", at: "2026-09-16T09:00:00+08:00" });
    expect(reviewVisible([r1, back], r1, NOW)).toBe(true);
  });

  it("stays hidden before 14 days pass with no reply", () => {
    const r1 = review({ id: "r1", questId: "q8", raterId: "u2", rateeId: "u0", at: "2026-09-13T12:30:00+08:00" });
    expect(reviewVisible([r1], r1, NOW)).toBe(false); // 3 days old, no reply
  });

  it("becomes visible once REVIEW_REVEAL_MS has passed, reply or not", () => {
    const r1 = review({ id: "r1", questId: "q8", raterId: "u2", rateeId: "u0", at: "2026-09-13T12:30:00+08:00" });
    const later = NOW + REVIEW_REVEAL_MS - Date.parse(r1.at) + 1;
    expect(reviewVisible([r1], r1, Date.parse(r1.at) + REVIEW_REVEAL_MS - 1)).toBe(false); // 1ms short
    expect(reviewVisible([r1], r1, Date.parse(r1.at) + REVIEW_REVEAL_MS)).toBe(true); // exactly at the boundary
    void later;
  });
});

describe("canRate", () => {
  it("allows the poster or doer of a paid quest with no existing review", () => {
    expect(canRate(quest({ status: "paid" }), "poster", null)).toBe(true);
    expect(canRate(quest({ status: "paid" }), "doer", null)).toBe(true);
  });

  it("rejects a quest that isn't paid yet", () => {
    expect(canRate(quest({ status: "completed" }), "poster", null)).toBe(false);
  });

  it("rejects a visitor or applicant, even on a paid quest", () => {
    expect(canRate(quest({ status: "paid" }), "visitor", null)).toBe(false);
    expect(canRate(quest({ status: "paid" }), "applicant", null)).toBe(false);
  });

  it("rejects once the viewer already has a review on this quest", () => {
    expect(canRate(quest({ status: "paid" }), "poster", review())).toBe(false);
  });
});
