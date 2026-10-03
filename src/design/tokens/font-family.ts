/* ADR-002's "family absorbs weight" rule, generalized past the five named
   type roles (display/title/body/label/caps/money) in type.ts — Button's
   own text style is a bespoke, component-local choice (bold Instrument
   Sans, its own letterSpacing) that was never one of those roles, exactly
   as SIZES' literal 14px/20px/26px paddings in ds-bundle.js's Button.jsx
   are component-local choices, not tokens.

   WEIGHT_NAMES here is a hand-kept duplicate of
   scripts/lib/parse-tokens.ts's table of the same name (scripts/ is
   build-time tooling, not meant to ship in the app bundle, so this is a
   second copy rather than a shared import) — the drift test below keeps
   the two identical rather than trusting that by convention. */
import { fontAssets } from "./fonts";

export const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

/** e.g. fontFamilyName("Instrument Sans", 700) -> "InstrumentSans_700Bold".
    Throws immediately (at call time, which for a module-level constant
    means at import time) if that exact asset isn't bundled — the same
    fail-loud contract gen-tokens.ts's fontModuleName() has. */
export function fontFamilyName(family: string, weight: number): string {
  const weightName = WEIGHT_NAMES[weight];
  if (!weightName) throw new Error("font-family: no Google-Fonts weight name known for numeric weight " + weight);
  const name = family.replace(/\s+/g, "") + "_" + weight + weightName;
  if (!(name in fontAssets)) {
    throw new Error("font-family: " + name + " is not a bundled font asset (src/design/tokens/fonts.ts)");
  }
  return name;
}
