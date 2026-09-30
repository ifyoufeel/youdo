import { createSupabaseUsersPort } from "../users";
import { createFakeClient, fakeOk, fakeError } from "../test-support/fake-client";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

const ROW = {
  id: "u0",
  name: "Alex L.",
  rating: 4.8,
  quests_completed: 27,
  verified: true,
  area: "Da'an",
  home_x: 1920,
  home_y: -2260,
  cancel_rate: 0.03,
  bio: "bio",
  phone: "+886 912 345 678",
  email: "alex.l@example.tw",
  bank: "CTBC •••• 4417",
  joined: "2025-11-04T02:00:00.000Z",
};

describe("supabase users port (mocked client — no live project)", () => {
  it("getUser maps a profiles row into the User shape, home_x/home_y into a Point", async () => {
    const { client, calls } = createFakeClient([fakeOk(ROW)]);
    mockState.client = client;

    const user = await createSupabaseUsersPort().getUser("u0");

    expect(user).toEqual({
      id: "u0",
      name: "Alex L.",
      rating: 4.8,
      questsCompleted: 27,
      verified: true,
      area: "Da'an",
      home: { x: 1920, y: -2260 },
      cancelRate: 0.03,
      bio: "bio",
      phone: "+886 912 345 678",
      email: "alex.l@example.tw",
      bank: "CTBC •••• 4417",
      joined: "2025-11-04T02:00:00.000Z",
    });
    expect(calls.some((c) => c.method === "eq" && c.params[0] === "id" && c.params[1] === "u0")).toBe(true);
  });

  it("getUser returns null for no row, not an error", async () => {
    const { client } = createFakeClient([fakeOk(null)]);
    mockState.client = client;
    await expect(createSupabaseUsersPort().getUser("no-such-user")).resolves.toBeNull();
  });

  it("listUsers pages via a `gt(id, cursor)` cursor, one past limit to decide nextCursor", async () => {
    const rows = Array.from({ length: 3 }, (_, i) => ({ ...ROW, id: `u${i}` }));
    const { client, calls } = createFakeClient([fakeOk(rows)]);
    mockState.client = client;

    const page = await createSupabaseUsersPort().listUsers({ limit: 2, cursor: "u-1" });

    expect(page.items.map((u) => u.id)).toEqual(["u0", "u1"]);
    expect(page.nextCursor).toBe("u1");
    expect(calls.some((c) => c.method === "gt" && c.params[0] === "id" && c.params[1] === "u-1")).toBe(true);
    expect(calls.some((c) => c.method === "limit" && c.params[0] === 3)).toBe(true);
  });

  it("listUsers' nextCursor is null once the page doesn't overflow the limit", async () => {
    const { client } = createFakeClient([fakeOk([ROW])]);
    mockState.client = client;
    const page = await createSupabaseUsersPort().listUsers({ limit: 20 });
    expect(page.nextCursor).toBeNull();
  });

  it("updateProfile sends only the patched columns, home split into home_x/home_y", async () => {
    const { client, calls } = createFakeClient([fakeOk({ ...ROW, name: "New Name" })]);
    mockState.client = client;

    const user = await createSupabaseUsersPort().updateProfile(
      "u0",
      { name: "New Name", home: { x: 1, y: 2 } },
      { idempotencyKey: "k" }
    );

    expect(user.name).toBe("New Name");
    const updateCall = calls.find((c) => c.method === "update");
    expect(updateCall?.params[0]).toEqual({ name: "New Name", home_x: 1, home_y: 2 });
  });

  it("updateProfile propagates an error (e.g. a column-grant rejection) rather than swallowing it", async () => {
    const { client } = createFakeClient([fakeError("permission denied for column bank")]);
    mockState.client = client;
    await expect(
      createSupabaseUsersPort().updateProfile("u0", { name: "x" }, { idempotencyKey: "k" })
    ).rejects.toBeTruthy();
  });

  it("deleteAccount calls the delete_account RPC with the idempotency key, ignoring the userId param", async () => {
    const { client, calls } = createFakeClient([fakeOk(null)]);
    mockState.client = client;

    await createSupabaseUsersPort().deleteAccount("u0", { idempotencyKey: "k-1" });

    expect(calls[0]).toMatchObject({ rpc: "delete_account", args: { p_idempotency_key: "k-1" } });
  });
});
