import { createSupabaseThreadsPort } from "../threads";
import { createFakeClient, fakeOk, fakeError, fakeCount } from "../test-support/fake-client";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

const THREAD_ROW = {
  id: "t1",
  quest_id: "q1",
  poster_id: "u0",
  doer_id: "u1",
  last_message_at: "2026-09-16T03:00:00.000Z",
};

const MESSAGE_ROW = { id: "m1", sender_id: "u1", body: "Hi there", at: "2026-09-16T03:00:00.000Z" };

describe("supabase threads port (mocked client — no live project)", () => {
  it("listThreadsForUser relies on RLS alone, no explicit poster/doer filter", async () => {
    const { client, calls } = createFakeClient([fakeOk([THREAD_ROW])]);
    mockState.client = client;

    const threads = await createSupabaseThreadsPort().listThreadsForUser("u0");

    expect(threads).toEqual([{ id: "t1", questId: "q1", posterId: "u0", doerId: "u1", lastMessageAt: THREAD_ROW.last_message_at }]);
    expect(calls.some((c) => c.method === "eq")).toBe(false);
  });

  it("getThread reads by id", async () => {
    const { client } = createFakeClient([fakeOk(THREAD_ROW)]);
    mockState.client = client;
    const thread = await createSupabaseThreadsPort().getThread("t1");
    expect(thread?.id).toBe("t1");
  });

  it("listMessages orders ascending by at", async () => {
    const { client, calls } = createFakeClient([fakeOk([MESSAGE_ROW])]);
    mockState.client = client;

    const messages = await createSupabaseThreadsPort().listMessages("t1");

    expect(messages).toEqual([{ id: "m1", senderId: "u1", body: "Hi there", at: MESSAGE_ROW.at }]);
    expect(calls.some((c) => c.method === "order" && c.params[1] && (c.params[1] as { ascending: boolean }).ascending)).toBe(
      true
    );
  });

  it("unreadCountForThread counts messages from the other side after the viewer's own read_at", async () => {
    const { client, calls } = createFakeClient([fakeOk({ read_at: "2026-09-16T02:00:00.000Z" }), fakeCount(3)]);
    mockState.client = client;

    const count = await createSupabaseThreadsPort().unreadCountForThread("t1", "u0");

    expect(count).toBe(3);
    expect(calls.some((c) => c.method === "neq" && c.params[0] === "sender_id" && c.params[1] === "u0")).toBe(true);
    expect(calls.some((c) => c.method === "gt" && c.params[0] === "at")).toBe(true);
  });

  it("unreadCountForThread counts everything when the viewer has never read the thread", async () => {
    const { client, calls } = createFakeClient([fakeOk(null), fakeCount(2)]);
    mockState.client = client;

    const count = await createSupabaseThreadsPort().unreadCountForThread("t1", "u0");

    expect(count).toBe(2);
    expect(calls.some((c) => c.method === "gt")).toBe(false);
  });

  it("sendMessage calls the send_message RPC, ignoring the senderId param", async () => {
    const { client, calls } = createFakeClient([fakeOk(MESSAGE_ROW)]);
    mockState.client = client;

    const message = await createSupabaseThreadsPort().sendMessage("t1", "ignored", "Hi there", {
      idempotencyKey: "k",
    });

    expect(message.body).toBe("Hi there");
    expect(calls[0]).toMatchObject({
      rpc: "send_message",
      args: { p_thread_id: "t1", p_body: "Hi there", p_idempotency_key: "k" },
    });
  });

  it("propagates send_message's closed-thread rejection rather than swallowing it", async () => {
    const { client } = createFakeClient([fakeError("This quest is closed, so the thread is read-only")]);
    mockState.client = client;
    await expect(
      createSupabaseThreadsPort().sendMessage("t1", "u1", "hi", { idempotencyKey: "k" })
    ).rejects.toBeTruthy();
  });

  it("markThreadRead upserts thread_read_at directly (Phase 1's RLS covers it, no RPC)", async () => {
    const { client, calls } = createFakeClient([fakeOk(null)]);
    mockState.client = client;

    await createSupabaseThreadsPort().markThreadRead("t1", "u0");

    expect(calls.some((c) => c.table === "thread_read_at" && c.method === "upsert")).toBe(true);
  });

  it("subscribeToThread maps a realtime INSERT payload directly (no hidden columns to protect)", () => {
    const { client, subscriptions } = createFakeClient();
    mockState.client = client;

    const onMessage = jest.fn();
    const sub = createSupabaseThreadsPort().subscribeToThread("t1", onMessage);

    expect(subscriptions[0]).toMatchObject({ channelName: "thread:t1", event: "INSERT" });
    subscriptions[0].callback({ new: MESSAGE_ROW });

    expect(onMessage).toHaveBeenCalledWith({ id: "m1", senderId: "u1", body: "Hi there", at: MESSAGE_ROW.at });
    expect(() => sub.unsubscribe()).not.toThrow();
  });
});
