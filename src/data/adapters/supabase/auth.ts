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
   handoff. */
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { InvalidOtpError, type AuthPort, type Session } from "../../ports/auth";
import { supabase } from "./client";

// Registers the listener that closes the in-app browser once the OAuth
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

export function createSupabaseAuthPort(): AuthPort {
  return {
    async getSession() {
      const { data, error } = await supabase().auth.getSession();
      if (error) throw error;
      return toSession(data.session?.user.id);
    },

    async signInWithGoogle() {
      const redirectTo = AuthSession.makeRedirectUri();
      const { data, error } = await supabase().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) {
        throw new Error("signInWithGoogle: Supabase returned no authorization URL");
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== "success" || !result.url) {
        throw new Error("Google sign-in was cancelled");
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
        if (!session) throw new Error("signInWithGoogle: no session after setSession");
        return session;
      }

      if (code) {
        const { data: exchanged, error: exchangeError } = await supabase().auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        const session = toSession(exchanged.session?.user.id);
        if (!session) throw new Error("signInWithGoogle: no session after exchangeCodeForSession");
        return session;
      }

      throw new Error("signInWithGoogle: redirect carried neither tokens nor an authorization code");
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
