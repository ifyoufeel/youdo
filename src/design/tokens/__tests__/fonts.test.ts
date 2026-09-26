/* The one integration test protecting the seam between generated type.ts
   (ADR-002's fontFamily strings, e.g. "InstrumentSans_600SemiBold") and
   hand-written fonts.ts (the actual @expo-google-fonts/* module map) — if
   these ever drift, a <Text> renders with a missing glyph at runtime
   instead of failing a build. Walks every fontFamily value in `type`,
   generically, so a new type role added later is covered automatically. */
import { type } from "../type";
import { fontAssets } from "../fonts";

function collectFontFamilies(value: unknown, out: string[]): void {
  if (value === null || typeof value !== "object") return;
  for (const [key, v] of Object.entries(value)) {
    if (key === "fontFamily" && typeof v === "string") out.push(v);
    else collectFontFamilies(v, out);
  }
}

describe("fonts.ts covers every fontFamily type.ts emits", () => {
  it("every type role's fontFamily string is a bundled font asset", () => {
    const families: string[] = [];
    collectFontFamilies(type, families);
    expect(families.length).toBeGreaterThan(0); // sanity: the walk actually found some

    const missing = families.filter((f) => !(f in fontAssets));
    expect(missing).toEqual([]);
  });
});
