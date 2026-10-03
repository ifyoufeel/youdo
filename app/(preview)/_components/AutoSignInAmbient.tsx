/* Unlike AutoSignedIn (a fresh, isolated QueryClient + Repository +
   AuthSession stack per specimen), this signs in against the AMBIENT
   providers app/_layout.tsx already wraps every route in. Needed for any
   gallery frame whose content does real in-app navigation (router.push)
   to a route outside (preview) — like tapping a QuestCard to its real
   /quest/[id] page — since that navigation unmounts back to the shared
   root layout, not back into a frame-local provider subtree. A frame
   using AutoSignedIn's isolated session would lose its sign-in the
   moment it navigated away; this one doesn't, because there's only ever
   the one session. */
import { useEffect, type ReactNode } from "react";
import { useAuthSession } from "@data/auth-session";

export function AutoSignInAmbient({ children }: { children: ReactNode }) {
  const { status, signInWithGoogle } = useAuthSession();
  useEffect(() => {
    if (status === "signedOut") signInWithGoogle();
  }, [status, signInWithGoogle]);
  return <>{children}</>;
}
