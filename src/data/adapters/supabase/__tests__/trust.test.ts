import { createSupabaseTrustPort } from "../trust";
import { createFakeClient, fakeOk, fakeError } from "../test-support/fake-client";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

const REPORT_ROW = {
  id: "rp1",
  reporter_id: "u0",
  target_user_id: "u3",
  reason: "Rude in chat",
  at: "2026-09-16T02:00:00.000Z",
};

describe("supabase trust port (mocked client — no live project)", () => {
  it("reportUser calls the report_user RPC, ignoring the reporterId param", async () => {
    const { client, calls } = createFakeClient([fakeOk(REPORT_ROW)]);
    mockState.client = client;

    const report = await createSupabaseTrustPort().reportUser("ignored", "u3", "Rude in chat", {
      idempotencyKey: "k",
    });

    expect(report.reason).toBe("Rude in chat");
    expect(calls[0]).toMatchObject({
      rpc: "report_user",
      args: { p_target_user_id: "u3", p_reason: "Rude in chat", p_idempotency_key: "k" },
    });
  });

  it("propagates the RPC's can't-report-yourself rejection", async () => {
    const { client } = createFakeClient([fakeError("You can't report yourself")]);
    mockState.client = client;
    await expect(
      createSupabaseTrustPort().reportUser("u0", "u0", "reason", { idempotencyKey: "k" })
    ).rejects.toBeTruthy();
  });

  it("blockUser upserts blocked_users directly (Phase 1's RLS + check constraint cover it, no RPC)", async () => {
    const { client, calls } = createFakeClient([fakeOk(null)]);
    mockState.client = client;

    await createSupabaseTrustPort().blockUser("u0", "u3", { idempotencyKey: "k" });

    expect(calls[0]).toMatchObject({ table: "blocked_users", method: "from" });
    expect(calls.some((c) => c.method === "upsert" && (c.params[0] as { user_id: string }).user_id === "u0")).toBe(
      true
    );
  });

  it("listBlockedUserIds reads blocked_users scoped by user_id", async () => {
    const { client, calls } = createFakeClient([fakeOk([{ blocked_id: "u3" }])]);
    mockState.client = client;

    const ids = await createSupabaseTrustPort().listBlockedUserIds("u0");

    expect(ids).toEqual(["u3"]);
    expect(calls.some((c) => c.method === "eq" && c.params[0] === "user_id" && c.params[1] === "u0")).toBe(true);
  });
});
