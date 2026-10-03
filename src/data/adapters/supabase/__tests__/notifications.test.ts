import { createSupabaseNotificationsPort } from "../notifications";
import { createFakeClient, fakeOk } from "../test-support/fake-client";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

const NOTIFICATION_ROW = {
  id: "n1",
  user_id: "u0",
  type: "offer_received" as const,
  quest_id: "q1",
  body: "Someone offered on your quest",
  at: "2026-09-16T03:00:00.000Z",
  read_at: null,
};

describe("supabase notifications port (mocked client — no live project)", () => {
  it("listForUser reads notifications scoped by user_id, newest first", async () => {
    const { client, calls } = createFakeClient([fakeOk([NOTIFICATION_ROW])]);
    mockState.client = client;

    const notifications = await createSupabaseNotificationsPort().listForUser("u0");

    expect(notifications).toEqual([
      { id: "n1", userId: "u0", type: "offer_received", questId: "q1", body: "Someone offered on your quest", at: NOTIFICATION_ROW.at, readAt: null },
    ]);
    expect(calls.some((c) => c.method === "eq" && c.params[0] === "user_id" && c.params[1] === "u0")).toBe(true);
    expect(calls.some((c) => c.method === "order" && c.params[0] === "at")).toBe(true);
  });

  it("markAllRead calls the mark_all_read RPC, ignoring the userId param", async () => {
    const { client, calls } = createFakeClient([fakeOk(null)]);
    mockState.client = client;

    await createSupabaseNotificationsPort().markAllRead("u0", { idempotencyKey: "k-1" });

    expect(calls[0]).toMatchObject({ rpc: "mark_all_read", args: { p_idempotency_key: "k-1" } });
  });

  it("subscribeToUser maps a realtime INSERT payload directly", () => {
    const { client, subscriptions } = createFakeClient();
    mockState.client = client;

    const onNotification = jest.fn();
    const sub = createSupabaseNotificationsPort().subscribeToUser("u0", onNotification);

    expect(subscriptions[0]).toMatchObject({ channelName: "notifications:u0", event: "INSERT" });
    subscriptions[0].callback({ new: NOTIFICATION_ROW });

    expect(onNotification).toHaveBeenCalledWith({
      id: "n1",
      userId: "u0",
      type: "offer_received",
      questId: "q1",
      body: "Someone offered on your quest",
      at: NOTIFICATION_ROW.at,
      readAt: null,
    });
    expect(() => sub.unsubscribe()).not.toThrow();
  });
});
