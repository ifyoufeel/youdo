import { createSupabaseAuthPort } from "../auth";
import { InvalidOtpError } from "../../../ports/auth";
import { createFakeClient, fakeOk, fakeError } from "../test-support/fake-client";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

const mockOpenAuthSessionAsync = jest.fn();
jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: (...args: unknown[]) => mockOpenAuthSessionAsync(...args),
}));
jest.mock("expo-auth-session", () => ({
  makeRedirectUri: () => "youdo://redirect",
}));

describe("supabase auth port (mocked client + expo-web-browser/expo-auth-session — no live project)", () => {
  beforeEach(() => {
    mockOpenAuthSessionAsync.mockReset();
  });

  it("getSession maps a real session to { userId }, and null to null", async () => {
    const { client: c1 } = createFakeClient([fakeOk({ session: { user: { id: "u0" } } })]);
    mockState.client = c1;
    await expect(createSupabaseAuthPort().getSession()).resolves.toEqual({ userId: "u0" });

    const { client: c2 } = createFakeClient([fakeOk({ session: null })]);
    mockState.client = c2;
    await expect(createSupabaseAuthPort().getSession()).resolves.toBeNull();
  });

  it("signInWithGoogle opens the OAuth URL and exchanges an implicit-flow token redirect for a session", async () => {
    const { client, calls } = createFakeClient([
      fakeOk({ url: "https://project.supabase.co/auth/v1/authorize?...", provider: "google" }),
      fakeOk({ session: { user: { id: "u0" } } }),
    ]);
    mockState.client = client;
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: "success",
      url: "youdo://redirect#access_token=at-1&refresh_token=rt-1",
    });

    const session = await createSupabaseAuthPort().signInWithGoogle();

    expect(session).toEqual({ userId: "u0" });
    expect(calls.some((c) => c.method === "auth.signInWithOAuth")).toBe(true);
    expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(expect.any(String), "youdo://redirect");
    const setSessionCall = calls.find((c) => c.method === "auth.setSession");
    expect(setSessionCall?.params[0]).toEqual({ access_token: "at-1", refresh_token: "rt-1" });
  });

  it("signInWithGoogle exchanges a PKCE-flow authorization code for a session", async () => {
    const { client, calls } = createFakeClient([
      fakeOk({ url: "https://project.supabase.co/auth/v1/authorize?...", provider: "google" }),
      fakeOk({ session: { user: { id: "u0" } } }),
    ]);
    mockState.client = client;
    mockOpenAuthSessionAsync.mockResolvedValue({ type: "success", url: "youdo://redirect?code=abc123" });

    const session = await createSupabaseAuthPort().signInWithGoogle();

    expect(session).toEqual({ userId: "u0" });
    const exchangeCall = calls.find((c) => c.method === "auth.exchangeCodeForSession");
    expect(exchangeCall?.params[0]).toBe("abc123");
  });

  it("signInWithGoogle throws when the browser flow is cancelled or dismissed", async () => {
    const { client } = createFakeClient([fakeOk({ url: "https://x", provider: "google" })]);
    mockState.client = client;
    mockOpenAuthSessionAsync.mockResolvedValue({ type: "cancel" });

    await expect(createSupabaseAuthPort().signInWithGoogle()).rejects.toThrow(/cancelled/);
  });

  it("sendOtp routes to signInWithOtp with email or phone depending on method", async () => {
    const { client: c1, calls: calls1 } = createFakeClient([fakeOk(null)]);
    mockState.client = c1;
    await createSupabaseAuthPort().sendOtp("a@b.com", "email");
    expect(calls1[0].params[0]).toEqual({ email: "a@b.com" });

    const { client: c2, calls: calls2 } = createFakeClient([fakeOk(null)]);
    mockState.client = c2;
    await createSupabaseAuthPort().sendOtp("+886900000000", "phone");
    expect(calls2[0].params[0]).toEqual({ phone: "+886900000000" });
  });

  it("verifyOtp infers email vs. phone from the contact string's own shape", async () => {
    const { client: c1, calls: calls1 } = createFakeClient([fakeOk({ session: { user: { id: "u0" } } })]);
    mockState.client = c1;
    await createSupabaseAuthPort().verifyOtp("a@b.com", "123456");
    expect(calls1[0].params[0]).toMatchObject({ email: "a@b.com", type: "email" });

    const { client: c2, calls: calls2 } = createFakeClient([fakeOk({ session: { user: { id: "u0" } } })]);
    mockState.client = c2;
    await createSupabaseAuthPort().verifyOtp("+886900000000", "123456");
    expect(calls2[0].params[0]).toMatchObject({ phone: "+886900000000", type: "sms" });
  });

  it("verifyOtp collapses every real failure into InvalidOtpError, matching the port's one modeled failure case", async () => {
    const { client } = createFakeClient([fakeError("Token has expired or is invalid")]);
    mockState.client = client;
    await expect(createSupabaseAuthPort().verifyOtp("a@b.com", "000000")).rejects.toThrow(InvalidOtpError);
  });

  it("signOut calls through to auth.signOut", async () => {
    const { client, calls } = createFakeClient([fakeOk(null)]);
    mockState.client = client;
    await createSupabaseAuthPort().signOut();
    expect(calls.some((c) => c.method === "auth.signOut")).toBe(true);
  });
});
