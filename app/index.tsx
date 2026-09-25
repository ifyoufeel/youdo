/* ADR-012's cold-start gate: unlike the preview rail (which boots
   signed-in for reviewability), the real app has no default-signed-in
   escape hatch — a freshly installed app always starts at onboarding.
   `status === "loading"` covers the ~120-400ms the memory adapter's
   simulated getSession() takes to resolve on mount; rendering nothing
   for that instant beats flashing onboarding before a real session has
   had a chance to resolve. */
import { Redirect } from "expo-router";
import { useAuthSession } from "@data/auth-session";

export default function Index() {
  const { status } = useAuthSession();

  if (status === "loading") return null;
  if (status === "signedOut") return <Redirect href="/(onboarding)/welcome" />;

  // TODO Phase 7: redirect to /(tabs) once the tab shell exists — the
  // preview gallery is a placeholder destination for a signed-in session
  // until then.
  return <Redirect href="/(preview)/tokens" />;
}
