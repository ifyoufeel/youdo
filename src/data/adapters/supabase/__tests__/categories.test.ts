import { createSupabaseCategoriesPort } from "../categories";
import { createFakeClient, fakeOk } from "../test-support/fake-client";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

describe("supabase categories port (mocked client — no live project)", () => {
  it("selects id/label from categories, ordered", async () => {
    const { client, calls } = createFakeClient([fakeOk([{ id: "moving", label: "Moving" }])]);
    mockState.client = client;

    const port = createSupabaseCategoriesPort();
    const result = await port.listCategories();

    expect(result).toEqual([{ id: "moving", label: "Moving" }]);
    expect(calls[0]).toMatchObject({ table: "categories", method: "from" });
    expect(calls.some((c) => c.method === "select" && c.params[0] === "id, label")).toBe(true);
  });

  it("propagates a query error rather than swallowing it", async () => {
    const { client } = createFakeClient([{ data: null, error: { message: "boom" } }]);
    mockState.client = client;

    const port = createSupabaseCategoriesPort();
    await expect(port.listCategories()).rejects.toEqual({ message: "boom" });
  });
});
