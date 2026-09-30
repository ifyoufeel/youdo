import { createSupabaseAreasPort } from "../areas";
import { createFakeClient, fakeOk } from "../test-support/fake-client";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

describe("supabase areas port (mocked client — no live project)", () => {
  it("maps point_x/point_y rows into Point-shaped areas", async () => {
    const { client, calls } = createFakeClient([fakeOk([{ name: "Da'an", point_x: 1800, point_y: -2200 }])]);
    mockState.client = client;

    const port = createSupabaseAreasPort();
    const result = await port.listAreas();

    expect(result).toEqual([{ name: "Da'an", point: { x: 1800, y: -2200 } }]);
    expect(calls[0]).toMatchObject({ table: "areas", method: "from" });
  });
});
