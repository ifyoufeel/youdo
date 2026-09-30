import { createSupabaseReviewsPort } from "../reviews";
import { createFakeClient, fakeOk, fakeError } from "../test-support/fake-client";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

const REVIEW_ROW = {
  id: "r1",
  quest_id: "q8",
  rater_id: "u2",
  ratee_id: "u0",
  rating: 5,
  comment: "Great job",
  at: "2026-09-10T02:00:00.000Z",
};

describe("supabase reviews port (mocked client — no live project)", () => {
  it("listReviewsForUser scopes by ratee_id, relying on Phase 1/7's RLS for the reveal rule", async () => {
    const { client, calls } = createFakeClient([fakeOk([REVIEW_ROW])]);
    mockState.client = client;

    const reviews = await createSupabaseReviewsPort().listReviewsForUser("u0");

    expect(reviews).toEqual([
      { id: "r1", questId: "q8", raterId: "u2", rateeId: "u0", rating: 5, comment: "Great job", at: REVIEW_ROW.at },
    ]);
    expect(calls.some((c) => c.method === "eq" && c.params[0] === "ratee_id" && c.params[1] === "u0")).toBe(true);
  });

  it("myReviewOnQuest scopes by quest_id + rater_id — the rater always sees their own review, blind or not", async () => {
    const { client, calls } = createFakeClient([fakeOk(REVIEW_ROW)]);
    mockState.client = client;

    const review = await createSupabaseReviewsPort().myReviewOnQuest("q8", "u2");

    expect(review?.id).toBe("r1");
    expect(calls.some((c) => c.method === "eq" && c.params[0] === "rater_id" && c.params[1] === "u2")).toBe(true);
  });

  it("submitReview calls the submit_review RPC, ignoring the raterId param", async () => {
    const { client, calls } = createFakeClient([fakeOk(REVIEW_ROW)]);
    mockState.client = client;

    const review = await createSupabaseReviewsPort().submitReview("q8", "ignored", "u0", 5, "Great job", {
      idempotencyKey: "k",
    });

    expect(review.rating).toBe(5);
    expect(calls[0]).toMatchObject({
      rpc: "submit_review",
      args: { p_quest_id: "q8", p_ratee_id: "u0", p_rating: 5, p_comment: "Great job", p_idempotency_key: "k" },
    });
  });

  it("propagates the RPC's already-rated rejection rather than swallowing it", async () => {
    const { client } = createFakeClient([fakeError("You've already rated this one")]);
    mockState.client = client;
    await expect(
      createSupabaseReviewsPort().submitReview("q8", "u2", "u0", 4, "", { idempotencyKey: "k" })
    ).rejects.toBeTruthy();
  });
});
