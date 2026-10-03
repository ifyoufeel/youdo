import { createSupabaseQuestsPort } from "../quests";
import { createFakeClient, fakeOk, fakeError } from "../test-support/fake-client";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

const QUEST_ROW = {
  id: "q1",
  poster_id: "u0",
  title: "Move a couch",
  payout_minor: 40000,
  payout_unit: "fixed" as const,
  category_id: "moving",
  point_x: 1800,
  point_y: -2200,
  estimated_minutes: 60,
  duration_label: null,
  scheduled_for: "2026-09-17T02:00:00.000Z",
  expires_at: "2026-09-18T02:00:00.000Z",
  created_at: "2026-09-16T02:00:00.000Z",
  status: "open" as const,
  accepted_offer_id: null,
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

describe("supabase quests port (mocked client — no live project)", () => {
  it("listQuests calls the list_quests RPC with every ListQuestsParams field mapped to its p_ arg", async () => {
    const { client, calls } = createFakeClient([fakeOk([{ ...QUEST_ROW, total_count: 1 }])]);
    mockState.client = client;

    const page = await createSupabaseQuestsPort().listQuests({
      center: { x: 0, y: 0 },
      radiusM: 5000,
      categoryId: "moving",
      minPayMinor: 1000,
      verifiedPostersOnly: true,
      todayOnly: true,
      search: "couch",
      sort: "pay",
      viewerId: "u1",
      limit: 10,
      cursor: "10",
    });

    expect(page.items).toHaveLength(1);
    expect(page.items[0].id).toBe("q1");
    expect(page.nextCursor).toBeNull(); // offset(10) + 1 item = 11, not < total_count(1)

    expect(calls[0]).toMatchObject({
      rpc: "list_quests",
      args: {
        p_center_x: 0,
        p_center_y: 0,
        p_radius_m: 5000,
        p_category_id: "moving",
        p_min_pay_minor: 1000,
        p_verified_posters_only: true,
        p_today_only: true,
        p_search: "couch",
        p_sort: "pay",
        p_viewer_id: "u1",
        p_limit: 10,
        p_offset: 10,
      },
    });
  });

  it("listQuests' nextCursor advances past the current offset while more rows remain", async () => {
    const { client } = createFakeClient([fakeOk([{ ...QUEST_ROW, total_count: 5 }])]);
    mockState.client = client;

    const page = await createSupabaseQuestsPort().listQuests({ center: { x: 0, y: 0 }, radiusM: 1000, limit: 1 });
    expect(page.nextCursor).toBe("1");
  });

  it("getQuest reads the quests_with_address view, not the base table", async () => {
    const { client, calls } = createFakeClient([fakeOk(QUEST_ROW)]);
    mockState.client = client;

    const quest = await createSupabaseQuestsPort().getQuest("q1");

    expect(quest?.addressLine).toBe("12 Some Rd");
    expect(calls[0]).toMatchObject({ table: "quests_with_address", method: "from" });
  });

  it("getQuest returns null for no row", async () => {
    const { client } = createFakeClient([fakeOk(null)]);
    mockState.client = client;
    await expect(createSupabaseQuestsPort().getQuest("no-such-quest")).resolves.toBeNull();
  });

  it("postQuest calls the post_quest RPC, ignoring input.posterId (server trusts auth.uid() only)", async () => {
    const { client, calls } = createFakeClient([fakeOk(QUEST_ROW)]);
    mockState.client = client;

    const quest = await createSupabaseQuestsPort().postQuest(
      {
        posterId: "someone-else",
        title: "Move a couch",
        details: "A couch",
        categoryId: "moving",
        payoutMinor: 40000,
        estimatedMinutes: 60,
        durationLabel: null,
        addressLine: "12 Some Rd",
        area: "Da'an",
        point: { x: 1800, y: -2200 },
        scheduledFor: "2026-09-17T02:00:00.000Z",
        expiresAt: "2026-09-18T02:00:00.000Z",
        requirements: [],
      },
      { idempotencyKey: "k-1" }
    );

    expect(quest.title).toBe("Move a couch");
    expect(calls[0].rpc).toBe("post_quest");
    expect(calls[0].args).toMatchObject({ p_title: "Move a couch", p_idempotency_key: "k-1" });
    expect((calls[0].args as Record<string, unknown>).p_posterId).toBeUndefined();
  });

  it("listMyQuests calls list_my_quests with no arguments (server derives the viewer from auth.uid())", async () => {
    const { client, calls } = createFakeClient([fakeOk([QUEST_ROW])]);
    mockState.client = client;

    const quests = await createSupabaseQuestsPort().listMyQuests("u0");

    expect(quests).toHaveLength(1);
    expect(calls[0]).toMatchObject({ rpc: "list_my_quests", args: undefined });
  });

  it("listSavedQuestIds/saveQuest/unsaveQuest hit saved_quests directly, no RPC", async () => {
    const port = createSupabaseQuestsPort();

    const { client: listClient, calls: listCalls } = createFakeClient([fakeOk([{ quest_id: "q4" }])]);
    mockState.client = listClient;
    expect(await port.listSavedQuestIds("u0")).toEqual(["q4"]);
    expect(listCalls[0]).toMatchObject({ table: "saved_quests", method: "from" });

    const { client: saveClient, calls: saveCalls } = createFakeClient([fakeOk(null)]);
    mockState.client = saveClient;
    await port.saveQuest("u0", "q1", { idempotencyKey: "k" });
    expect(saveCalls.some((c) => c.method === "upsert")).toBe(true);

    const { client: unsaveClient, calls: unsaveCalls } = createFakeClient([fakeOk(null)]);
    mockState.client = unsaveClient;
    await port.unsaveQuest("u0", "q1", { idempotencyKey: "k" });
    expect(unsaveCalls.some((c) => c.method === "delete")).toBe(true);
  });

  it("propagates a postgrest error from listQuests rather than swallowing it", async () => {
    const { client } = createFakeClient([fakeError("relation does not exist")]);
    mockState.client = client;
    await expect(
      createSupabaseQuestsPort().listQuests({ center: { x: 0, y: 0 }, radiusM: 1000 })
    ).rejects.toBeTruthy();
  });

  it("subscribeToQuest never trusts the realtime payload's own row — a change event refetches via quests_with_address instead", async () => {
    const { client, subscriptions } = createFakeClient([fakeOk(QUEST_ROW)]);
    mockState.client = client;

    const onChange = jest.fn();
    const sub = createSupabaseQuestsPort().subscribeToQuest("q1", onChange);

    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0]).toMatchObject({ channelName: "quest:q1", event: "UPDATE" });

    // Simulate a raw realtime payload carrying an address_line this
    // viewer shouldn't see — the handler must ignore it and refetch.
    subscriptions[0].callback({ new: { ...QUEST_ROW, address_line: "LEAKED ADDRESS" } });
    await Promise.resolve();
    await Promise.resolve();

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: "q1", addressLine: "12 Some Rd" }));
    expect(() => sub.unsubscribe()).not.toThrow();
  });

  it("startQuest/markDone/confirmDone call their own RPCs, ignoring the actorId param (server trusts auth.uid())", async () => {
    const port = createSupabaseQuestsPort();

    const { client: c1, calls: calls1 } = createFakeClient([fakeOk({ ...QUEST_ROW, status: "in_progress" })]);
    mockState.client = c1;
    const started = await port.startQuest("q1", "ignored", { idempotencyKey: "k" });
    expect(started.status).toBe("in_progress");
    expect(calls1[0]).toMatchObject({ rpc: "start_quest", args: { p_quest_id: "q1", p_idempotency_key: "k" } });

    const { client: c2, calls: calls2 } = createFakeClient([fakeOk({ ...QUEST_ROW, status: "completed" })]);
    mockState.client = c2;
    const done = await port.markDone("q1", "ignored", { idempotencyKey: "k" });
    expect(done.status).toBe("completed");
    expect(calls2[0]).toMatchObject({ rpc: "mark_done", args: { p_quest_id: "q1", p_idempotency_key: "k" } });

    const { client: c3, calls: calls3 } = createFakeClient([fakeOk({ ...QUEST_ROW, status: "paid" })]);
    mockState.client = c3;
    const paid = await port.confirmDone("q1", "ignored", { idempotencyKey: "k" });
    expect(paid.status).toBe("paid");
    expect(calls3[0]).toMatchObject({ rpc: "confirm_done", args: { p_quest_id: "q1", p_idempotency_key: "k" } });
  });

  it("cancelQuest/disputeQuest pass the reason through to their RPC", async () => {
    const port = createSupabaseQuestsPort();

    const { client: c1, calls: calls1 } = createFakeClient([fakeOk({ ...QUEST_ROW, status: "cancelled" })]);
    mockState.client = c1;
    const cancelled = await port.cancelQuest("q1", "ignored", "Changed my mind", { idempotencyKey: "k" });
    expect(cancelled.status).toBe("cancelled");
    expect(calls1[0]).toMatchObject({
      rpc: "cancel_quest",
      args: { p_quest_id: "q1", p_reason: "Changed my mind", p_idempotency_key: "k" },
    });

    const { client: c2, calls: calls2 } = createFakeClient([fakeOk({ ...QUEST_ROW, status: "disputed" })]);
    mockState.client = c2;
    const disputed = await port.disputeQuest("q1", "ignored", "Not done right", { idempotencyKey: "k" });
    expect(disputed.status).toBe("disputed");
    expect(calls2[0]).toMatchObject({
      rpc: "dispute_quest",
      args: { p_quest_id: "q1", p_reason: "Not done right", p_idempotency_key: "k" },
    });
  });

  it("propagates a lifecycle RPC's guard rejection rather than swallowing it", async () => {
    const { client } = createFakeClient([fakeError("A doer can't move this from open")]);
    mockState.client = client;
    await expect(
      createSupabaseQuestsPort().startQuest("q1", "u0", { idempotencyKey: "k" })
    ).rejects.toBeTruthy();
  });
});
