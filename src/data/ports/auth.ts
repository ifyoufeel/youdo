/* PRD §7.1 / ADR-007: Google OAuth or 6-digit OTP to email or phone, no
   passwords. Mirrors the mock flow already built in preview/app.js's
   OnboardingFlow (M1) — this is that same shape, formalized. */

export interface Session {
  userId: string;
}

/** Thrown by verifyOtp when the code is wrong. The prototype's mock used
    "000000" as its one deliberately-wrong code, simulated inside
    OnboardingFlow's own UI code (preview/app.js) — this is that same
    failure path made real and moved behind the port, per ADR-012's want
    for the failure path to actually exist rather than be screen-faked.
    The message here is a developer-facing default, not what a screen
    shows: a caller catches this by type and renders its own localized
    copy via the i18n seam, keeping "no hardcoded user-facing strings"
    intact even for error paths. */
export class InvalidOtpError extends Error {
  constructor() {
    super("Invalid OTP code");
    this.name = "InvalidOtpError";
  }
}

export interface AuthPort {
  getSession(): Promise<Session | null>;
  signInWithGoogle(): Promise<Session>;
  sendOtp(contact: string, method: "email" | "phone"): Promise<void>;
  verifyOtp(contact: string, code: string): Promise<Session>;
  signOut(): Promise<void>;
}
