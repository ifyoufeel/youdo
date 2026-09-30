import { createSupabaseOffersPort } from "../offers";
import { createFakeClient, fakeOk, fakeError } from "../test-support/fake-client";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

const OFFER_ROW = {
  id: "o1",
  quest_id: "q1",
  doer_id: "u1",
  amount_minor: 40000,
  status: "pending" as const,
  note: "I can do this",
  created_at: "2026-09-16T02:00:00.000Z",
  responded_at: null,
};

const QUEST_ROW = {
  id: "q1",
  poster_id: "u0",
  title: "Move a couch",
  payout_minor: 40000,
  payout_unit: "fixed" as const,
  category_id: "moving",
  point_x: 0,
  point_y: 0,
  estimated_minutes: 60,
  duration_label: null,
  scheduled_for: "2026-09-17T02:00:00.000Z",
  expires_at: "2026-09-18T02:00:00.000Z",
  created_at: "2026-09-16T02:00:00.000Z",
  status: "assigned" as const,
  accepted_offer_id: "o1",
  address_line: "12 Some Rd",
  area: "Da'an",
  details: "A couch",
  requirements: [],
  started_at: null,
  completed_at: null,
  paid_at: null,
  cancelled_at: null,
  cancelled_by: null,
  cancel_reason: null,
  disputed_at: null,
  dispute_reason: null,
};

describe("supabase offers port (mocked client — no live project)", () => {
  it("listOffersForQuest reads the offers table scoped by quest_id", async () => {
    const { client, calls } = createFakeClient([fakeOk([OFFER_ROW])]);
    mockState.client = client;

    const offers = await createSupabaseOffersPort().listOffersForQuest("q1");

    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ id: "o1", questId: "q1", doerId: "u1", amountMinor: 40000 });
    expect(calls.some((c) => c.method === "eq" && c.params[0] === "quest_id" && c.params[1] === "q1")).toBe(true);
  });

  it("myOfferOnQuest scopes to pending/accepted only", async () => {
    const { client, calls } = createFakeClient([fakeOk(OFFER_ROW)]);
    mockState.client = client;

    const offer = await createSupabaseOffersPort().myOfferOnQuest("q1", "u1");

    expect(offer?.id).toBe("o1");
    expect(calls.some((c) => c.method === "in" && c.params[0] === "status")).toBe(true);
  });

  it("sendOffer calls the send_offer RPC, never sending doerId (server trusts auth.uid())", async () => {
    const { client, calls } = createFakeClient([fakeOk(OFFER_ROW)]);
    mockState.client = client;

    const offer = await createSupabaseOffersPort().sendOffer("q1", "ignored", 40000, "I can do this", {
      idempotencyKey: "k-1",
    });

    expect(offer.id).toBe("o1");
    expect(calls[0]).toMatchObject({
      rpc: "send_offer",
      args: { p_quest_id: "q1", p_amount_minor: 40000, p_note: "I can do this", p_idempotency_key: "k-1" },
    });
    expect(Object.keys(calls[0].args as object)).not.toContain("p_doer_id");
  });

  it("withdrawOffer/declineOffer call their own RPCs", async () => {
    const { client: c1, calls: calls1 } = createFakeClient([fakeOk({ ...OFFER_ROW, status: "withdrawn" })]);
    mockState.client = c1;
    const withdrawn = await createSupabaseOffersPort().withdrawOffer("o1", { idempotencyKey: "k" });
    expect(withdrawn.status).toBe("withdrawn");
    expect(calls1[0]).toMatchObject({ rpc: "withdraw_offer", args: { p_offer_id: "o1", p_idempotency_key: "k" } });

    const { client: c2, calls: calls2 } = createFakeClient([fakeOk({ ...OFFER_ROW, status: "declined" })]);
    mockState.client = c2;
    const declined = await createSupabaseOffersPort().declineOffer("o1", { idempotencyKey: "k" });
    expect(declined.status).toBe("declined");
    expect(calls2[0]).toMatchObject({ rpc: "decline_offer", args: { p_offer_id: "o1", p_idempotency_key: "k" } });
  });

  it("acceptOffer unwraps the RETURNS TABLE(offer, quest) composite row into { offer, quest }", async () => {
    const { client, calls } = createFakeClient([
      fakeOk([{ offer: { ...OFFER_ROW, status: "accepted" }, quest: QUEST_ROW }]),
    ]);
    mockState.client = client;

    const result = await createSupabaseOffersPort().acceptOffer("o1", { idempotencyKey: "k" });

    expect(result.offer.status).toBe("accepted");
    expect(result.quest.status).toBe("assigned");
    expect(result.quest.acceptedOfferId).toBe("o1");
    expect(calls[0]).toMatchObject({ rpc: "accept_offer", args: { p_offer_id: "o1", p_idempotency_key: "k" } });
  });

  it("propagates an RPC error (e.g. a funds-short rejection) rather than swallowing it", async () => {
    const { client } = createFakeClient([fakeError("You need NT$100 more in your wallet to hold this")]);
    mockState.client = client;
    await expect(
      createSupabaseOffersPort().acceptOffer("o1", { idempotencyKey: "k" })
    ).rejects.toBeTruthy();
  });
});
