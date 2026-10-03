/* Pure geometry for <Sticker> (ADR-003) — zero RN imports, so the actual
   risky part (does the number sequence reproduce the brand's "pushes into
   paper on press, lifts off it on hover" feel?) is unit-testable without a
   renderer, ahead of the device spike ADR-003 asks for and this session
   has no hardware to run.

   Ported from the real web behavior, read directly out of ds-bundle.js —
   Card (1578-1663) and Button (272-411) both drive their boxShadow/
   transform off the exact same three hardcoded tokens, regardless of
   which shadow variant they started from:
     rest  -> the component's own base shadow, translate 0
     hover -> ALWAYS --shadow-sticker-lg (5,5), ALWAYS translate(-1px,-1px)
     press -> ALWAYS --shadow-pressed    (1,1), ALWAYS translate(2px,2px)
   i.e. on the web, hover/press never actually vary by base elevation —
   every shadowed component converges on the same two literal tokens.

   RN's <Sticker> takes an elevation prop the web components never needed
   (ADR-003's stated API is `<Sticker elevation color>`), so there's no
   web precedent for what hover/press should do at elevations other than
   the default. This generalizes the *literal* web behavior at the default
   elevation into a formula (hover = base+2, press = max(base-2, 1)) that
   reproduces the real numbers exactly there — sticker(3) -> hover 5,
   press 1, matching sticker-lg and pressed exactly — and extends
   sensibly to sm/lg, which the web version never exercised. The
   translate magnitudes stay fixed at every elevation, exactly as they
   are fixed (never scaled) in both real components. */

export type StickerElevation = "sm" | "md" | "lg";
export type StickerInteractionState = "rest" | "hover" | "press";

/** The three base (rest) shadow offsets, in px — semantic.shadow.stickerSm
    / .sticker / .stickerLg's dx (== dy for all three). Kept as a literal
    table here rather than importing the token file, so this module stays
    provable in isolation; Sticker.tsx cross-checks the two agree. */
const BASE_OFFSET: Record<StickerElevation, number> = { sm: 2, md: 3, lg: 5 };

export interface StickerGeometry {
  shadowDx: number;
  shadowDy: number;
  contentTranslateX: number;
  contentTranslateY: number;
}

export function stickerGeometry(elevation: StickerElevation, state: StickerInteractionState): StickerGeometry {
  const base = BASE_OFFSET[elevation];
  if (state === "rest") {
    return { shadowDx: base, shadowDy: base, contentTranslateX: 0, contentTranslateY: 0 };
  }
  if (state === "hover") {
    return { shadowDx: base + 2, shadowDy: base + 2, contentTranslateX: -1, contentTranslateY: -1 };
  }
  // press: the gap collapses toward 1px (ADR-003's own words), never past it —
  // matches --shadow-pressed exactly at the default "md" elevation.
  const pressed = Math.max(base - 2, 1);
  return { shadowDx: pressed, shadowDy: pressed, contentTranslateX: 2, contentTranslateY: 2 };
}
