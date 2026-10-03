import { createSupabaseUploadsPort } from "../uploads";
import { createFakeClient, fakeOk, fakeError } from "../test-support/fake-client";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

const FAKE_BUFFER = new ArrayBuffer(4);
const mockArrayBuffer = jest.fn(() => Promise.resolve(FAKE_BUFFER));
jest.mock("expo-file-system", () => ({
  File: class {
    arrayBuffer() {
      return mockArrayBuffer();
    }
  },
}));

jest.mock("expo-crypto", () => ({ randomUUID: () => "fixed-uuid-1" }));

describe("supabase uploads port (mocked client + expo-file-system/expo-crypto — no live project)", () => {
  beforeEach(() => {
    mockArrayBuffer.mockClear();
  });

  it("uploads to the right bucket under the caller's own uid, and returns the public URL", async () => {
    const { client, calls } = createFakeClient([
      fakeOk({ user: { id: "u0" } }),
      fakeOk({ id: "x", path: "u0/fixed-uuid-1.jpg", fullPath: "avatars/u0/fixed-uuid-1.jpg" }),
    ]);
    mockState.client = client;

    const url = await createSupabaseUploadsPort().uploadPhoto("file:///tmp/photo.jpg", "avatar");

    expect(url).toBe("https://fake.supabase.co/storage/v1/object/public/avatars/u0/fixed-uuid-1.jpg");
    const uploadCall = calls.find((c) => c.method === "storage.upload");
    expect(uploadCall?.params[0]).toBe("avatars");
    expect(uploadCall?.params[1]).toBe("u0/fixed-uuid-1.jpg");
    expect(uploadCall?.params[2]).toBe(FAKE_BUFFER);
    expect(uploadCall?.params[3]).toEqual({ contentType: "image/jpeg" });
  });

  it("routes quest photos to the quest-photos bucket", async () => {
    const { client, calls } = createFakeClient([fakeOk({ user: { id: "u1" } }), fakeOk({})]);
    mockState.client = client;

    await createSupabaseUploadsPort().uploadPhoto("file:///tmp/photo.png", "quest");

    const uploadCall = calls.find((c) => c.method === "storage.upload");
    expect(uploadCall?.params[0]).toBe("quest-photos");
    expect(uploadCall?.params[3]).toEqual({ contentType: "image/png" });
  });

  it("throws when there's no signed-in user to attribute the upload to", async () => {
    const { client } = createFakeClient([fakeOk({ user: null })]);
    mockState.client = client;
    await expect(createSupabaseUploadsPort().uploadPhoto("file:///tmp/x.jpg", "avatar")).rejects.toThrow(
      /not signed in/
    );
  });

  it("propagates an upload error rather than swallowing it", async () => {
    const { client } = createFakeClient([fakeOk({ user: { id: "u0" } }), fakeError("Payload too large")]);
    mockState.client = client;
    await expect(createSupabaseUploadsPort().uploadPhoto("file:///tmp/x.jpg", "avatar")).rejects.toBeTruthy();
  });
});
