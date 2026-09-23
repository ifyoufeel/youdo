/* PRD §7.1 / ADR-007: Google OAuth or 6-digit OTP to email or phone, no
   passwords. Mirrors the mock flow already built in preview/app.js's
   OnboardingFlow (M1) — this is that same shape, formalized. */

export interface Session {
  userId: string;
}

export interface AuthPort {
  getSession(): Promise<Session | null>;
  signInWithGoogle(): Promise<Session>;
  sendOtp(contact: string, method: "email" | "phone"): Promise<void>;
  verifyOtp(contact: string, code: string): Promise<Session>;
  signOut(): Promise<void>;
}
