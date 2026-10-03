/* Holds the native splash screen up until the three brand fonts have
   loaded, then renders children. `preventAutoHideAsync` is called at
   module scope (not inside the component) per expo-splash-screen's own
   guidance — called from inside a component/effect risks running after
   the splash screen has already auto-hidden. */
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect, type ReactNode } from "react";
import { fontAssets } from "./tokens/fonts";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden, or unsupported on this platform (e.g. web) — either
  // way there's nothing to prevent, so nothing to do here.
});

export function FontProvider({ children }: { children: ReactNode }) {
  const [loaded, error] = useFonts(fontAssets);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  if (error) {
    // Surfaced loudly rather than silently falling back to a system font —
    // a missing brand font is exactly the kind of thing ADR-002's whole
    // pipeline exists to catch before it reaches a screen.
    throw error;
  }

  return <>{children}</>;
}
