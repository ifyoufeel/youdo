import type { AuthPort, Session } from "../../ports/auth";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { meId } from "./store";

/* Mirrors preview/app.js's OnboardingFlow mock (M1): any contact/code
   "succeeds" and signs the one seeded identity (`meId`) in — there's no
   real backend yet to check credentials against, and the fixture only
   models a single "me". Session state is scoped per adapter instance
   (a closure, not a module-level variable) so two independent
   createMemoryAuthPort() calls — e.g. from separate tests, or a future
   multi-instance use — never leak sign-in state into each other. */
export function createMemoryAuthPort(): AuthPort {
  let session: Session | null = null;

  return {
    async getSession() {
      await simulateLatency();
      maybeInjectFault("getSession");
      return session;
    },

    async signInWithGoogle() {
      await simulateLatency();
      maybeInjectFault("signInWithGoogle");
      session = { userId: meId };
      return session;
    },

    async sendOtp() {
      await simulateLatency();
      maybeInjectFault("sendOtp");
      // Mock: no code is actually sent anywhere: verifyOtp accepts any code.
    },

    async verifyOtp() {
      await simulateLatency();
      maybeInjectFault("verifyOtp");
      session = { userId: meId };
      return session;
    },

    async signOut() {
      await simulateLatency();
      maybeInjectFault("signOut");
      session = null;
    },
  };
}
