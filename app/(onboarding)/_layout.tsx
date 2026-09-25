/* Real Expo Router navigation (push/back) per step, not the prototype's
   internal useState step machine — gets back-navigation and per-step web
   URLs for free, which ADR-001's file-based-router architecture is
   specifically there to buy. Screen headers are hidden: every onboarding
   screen renders its own TopBar via the Screen shell. */
import { Stack } from "expo-router";
import { OnboardingProvider } from "@features/onboarding/OnboardingContext";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  );
}
