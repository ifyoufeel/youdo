/* Real as of M7 (scaffold — never run against a live project, and this
   is the one file in this scaffold that can least be verified without
   one: Google OAuth needs real client credentials configured in both
   Google Cloud Console and the Supabase dashboard, and phone OTP needs a
   configured SMS provider — see supabase/migrations/..._auth.sql's own
   header comment and Phase 9's setup doc). Follows Supabase's own
   documented Expo/React Native OAuth pattern: signInWithOAuth with
   skipBrowserRedirect, open the returned URL in an auth session via
   expo-web-browser, then hand whatever the redirect carries back
   (tokens for the implicit flow, a code for PKCE) to supabase-js to
   actually establish the session — never parsed or trusted beyond that
   handoff.

   signInWithApple (M8) is deliberately NOT a third call to that same
   browserOAuthSignIn() helper on iOS — Apple's own App Store review
   guideline (4.8) requires the native "Sign in with Apple" button and
   system sheet (expo-apple-authentication) wherever a third-party social
   login is offered on iOS, not a browser redirect. This uses the native
   flow on iOS and falls back to the shared browser-OAuth helper
   everywhere else (Android/web), where Apple doesn't mandate the native
   button. */
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import { InvalidOtpError, type AuthPort, type Session } from "../../ports/auth";
import { supabase } from "./client";

// Registers the listener that closes the in-app browser once an OAuth
// redirect lands — a no-op outside of an active openAuthSessionAsync
// call, safe to call once at module load.
WebBrowser.maybeCompleteAuthSession();

function toSession(userId: string | undefined | null): Session | null {
  return userId ? { userId } : null;
}

/** The implicit flow returns tokens in the URL fragment (`#access_token=...`);
    URLSearchParams doesn't parse fragments, so this treats `#` as `?`
    before handing it off — the same trick Supabase's own web SDK uses
    internally for this exact shape. */
function paramsFromRedirect(url: string): URLSearchParams {
  const normalized = url.replace("#", "?");
  const queryStart = normalized.indexOf("?");
  return new URLSearchParams(queryStart === -1 ? "" : normalized.slice(queryStart + 1));
}

/** Shared by signInWithGoogle (every platform) and signInWithApple's
    non-iOS fallback — the same skipBrowserRedirect + expo-web-browser +
    "tokens or a code" handoff, parameterized only by provider name. */
async function browserOAuthSignIn(provider: "google" | "apple"): Promise<Session> {
  const redirectTo = AuthSession.makeRedirectUri();
  const { data, error } = await supabase().auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) {
    throw new Error(`signInWith${provider}: Supabase returned no authorization URL`);
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success" || !result.url) {
    throw new Error(`${provider} sign-in was cancelled`);
  }

  const params = paramsFromRedirect(result.url);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const code = params.get("code");

  if (accessToken && refreshToken) {
    const { data: sessionData, error: sessionError } = await supabase().auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw sessionError;
    const session = toSession(sessionData.session?.user.id);
    if (!session) throw new Error(`signInWith${provider}: no session after setSession`);
    return session;
  }

  if (code) {
    const { data: exchanged, error: exchangeError } = await supabase().auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    const session = toSession(exchanged.session?.user.id);
    if (!session) throw new Error(`signInWith${provider}: no session after exchangeCodeForSession`);
    return session;
  }

  throw new Error(`signInWith${provider}: redirect carried neither tokens nor an authorization code`);
}

/** Apple's native flow: a random raw nonce is sent to Supabase for
    verification, while Apple's own SDK is given that same nonce's SHA-256
    digest (Apple embeds the digest in the identity token it signs, and
    Supabase re-hashes the raw nonce it's given to check the two match) —
    the standard replay-protection shape Apple's and Supabase's own docs
    both describe for signInWithIdToken. */
async function nativeAppleSignIn(): Promise<Session> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    throw new Error("signInWithApple: Apple returned no identity token");
  }

  const { data, error } = await supabase().auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;
  const session = toSession(data.session?.user.id);
  if (!session) throw new Error("signInWithApple: no session after signInWithIdToken");
  return session;
}

export function createSupabaseAuthPort(): AuthPort {
  return {
    async getSession() {
      const { data, error } = await supabase().auth.getSession();
      if (error) throw error;
      return toSession(data.session?.user.id);
    },

    signInWithGoogle: () => browserOAuthSignIn("google"),

    async signInWithApple() {
      if (Platform.OS !== "ios") {
        return browserOAuthSignIn("apple");
      }
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        throw new Error("Sign in with Apple isn't available on this device");
      }
      return nativeAppleSignIn();
    },

    async sendOtp(contact, method) {
      const { error } =
        method === "email" ? await supabase().auth.signInWithOtp({ email: contact }) : await supabase().auth.signInWithOtp({ phone: contact });
      if (error) throw error;
    },

    // The port takes no `method` here (ports/auth.ts's own signature) —
    // email vs. phone is inferred from the contact string's shape, the
    // same call sendOtp's caller already made once at send time.
    async verifyOtp(contact, code) {
      const isEmail = contact.includes("@");
      const { data, error } = isEmail
        ? await supabase().auth.verifyOtp({ email: contact, token: code, type: "email" })
        : await supabase().auth.verifyOtp({ phone: contact, token: code, type: "sms" });

      // Every real GoTrue verifyOtp failure (wrong code, expired,
      // already used, ...) collapses to InvalidOtpError here — the port
      // only models the one failure case (ports/auth.ts's own header
      // comment: "'000000' is the mock's one deliberately-wrong code"),
      // and there's no live project to observe which other real error
      // shapes actually occur.
      if (error) throw new InvalidOtpError();
      const session = toSession(data.session?.user.id);
      if (!session) throw new InvalidOtpError();
      return session;
    },

    async signOut() {
      const { error } = await supabase().auth.signOut();
      if (error) throw error;
    },
  };
}
