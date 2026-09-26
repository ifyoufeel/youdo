/* Pure parsing/conversion functions for scripts/gen-tokens.ts (ADR-002).
   No filesystem access here — kept pure and framework-free so it can be
   exhaustively unit tested (scripts/__tests__/gen-tokens.test.ts) without
   touching disk. The CLI wrapper (gen-tokens.ts) does the reading/writing. */

/* ---------------- CSS parsing ---------------- */

export function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Extracts every `--name: value;` custom property from a :root{} block. */
export function extractVars(css: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    out.set(m[1], m[2].trim());
  }
  return out;
}

/** Resolves every `var(--x)` reference to a fixed point. Throws if a
    reference can't be resolved after enough passes to cover any chain
    depth these token files actually use (they're at most 2 deep, e.g.
    --stroke-ink -> --border-strong -> --ink-900). */
export function resolveVars(vars: Map<string, string>): Map<string, string> {
  const resolved = new Map(vars);
  const varRef = /var\((--[a-zA-Z0-9-]+)\)/g;
  for (let pass = 0; pass < 10; pass++) {
    let changed = false;
    for (const [key, value] of resolved) {
      const next = value.replace(varRef, (whole, ref: string) => {
        const name = ref.slice(2);
        if (!resolved.has(name)) return whole; // resolved in a later pass
        changed = true;
        return resolved.get(name)!;
      });
      if (next !== value) resolved.set(key, next);
    }
    if (!changed) {
      const unresolved = [...resolved.entries()].filter(([, v]) => varRef.test(v));
      if (unresolved.length) {
        throw new Error(
          "gen-tokens: unresolved var() reference(s) after " + pass + " passes: " +
          unresolved.map(([k]) => "--" + k).join(", ")
        );
      }
      return resolved;
    }
  }
  throw new Error("gen-tokens: var() resolution did not converge — a reference cycle?");
}

/* ---------------- unit conversions (ADR-002's three, and nothing else) ---------------- */

export function pxToNumber(value: string): number {
  const v = value.trim();
  if (v === "0") return 0; // CSS allows the bare zero-length token with no unit
  const m = /^(-?[\d.]+)px$/.exec(v);
  if (!m) throw new Error("gen-tokens: expected a px value, got " + JSON.stringify(value));
  return parseFloat(m[1]);
}

export function msToNumber(value: string): number {
  const m = /^(-?[\d.]+)ms$/.exec(value.trim());
  if (!m) throw new Error("gen-tokens: expected an ms value, got " + JSON.stringify(value));
  return parseFloat(m[1]);
}

/** em letterSpacing -> points, at a concrete font size. */
export function emToPoints(value: string, fontSizePx: number): number {
  const m = /^(-?[\d.]+)em$/.exec(value.trim());
  if (!m) throw new Error("gen-tokens: expected an em value, got " + JSON.stringify(value));
  return parseFloat(m[1]) * fontSizePx;
}

/** unitless line-height multiplier -> rounded px, at a concrete font size. */
export function unitlessLineHeightToPx(value: string, fontSizePx: number): number {
  const n = parseFloat(value.trim());
  if (Number.isNaN(n)) throw new Error("gen-tokens: expected a unitless number, got " + JSON.stringify(value));
  return Math.round(n * fontSizePx);
}

/* ---------------- fonts: family extraction + weight-name mapping ---------------- */

/** `'"Bricolage Grotesque","Instrument Sans",system-ui,sans-serif'` -> `"Bricolage Grotesque"`.
    RN's fontFamily is a single registered name, not a CSS fallback stack —
    only the primary (first) family in the CSS list is ever used; the rest
    is a web-only fallback chain that doesn't apply once the font is
    actually bundled (Phase 2). */
export function primaryFontFamily(cssFontStack: string): string {
  const first = cssFontStack.split(",")[0].trim();
  return first.replace(/^["']|["']$/g, "");
}

/** The numeric-weight -> Google-Fonts-package-name-suffix table. This is
    NOT 100->Thin...900->Black in every package — it's the real suffix each
    @expo-google-fonts/* package uses for that weight's static cut. Kept as
    a plain export (not re-derived) so src/design/tokens/fonts.ts (Phase 2)
    can be tested against the exact same names these functions emit. */
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

/** Which (family, weight) pairs Phase 2 actually bundles. Generation fails
    loudly here if a type role ever asks for a pair that isn't planned to
    be installed, rather than shipping a fontFamily string that silently
    falls back to a missing-glyph system font at runtime. */
export const AVAILABLE_WEIGHTS: Record<string, number[]> = {
  "Bricolage Grotesque": [200, 300, 400, 500, 600, 700, 800],
  "Instrument Sans": [400, 500, 600, 700],
  "JetBrains Mono": [400, 500, 700],
};

/** Family name with spaces stripped, matching the @expo-google-fonts/*
    export naming convention, e.g. "Bricolage Grotesque" -> "BricolageGrotesque". */
export function condensedFamilyName(family: string): string {
  return family.replace(/\s+/g, "");
}

/** ADR-002: "font family absorbs weight" — the one fontFamily string a
    <Text style> needs, e.g. "InstrumentSans_600SemiBold". Throws if that
    exact (family, weight) isn't in AVAILABLE_WEIGHTS, per the note above. */
export function fontModuleName(family: string, weight: number): string {
  const weights = AVAILABLE_WEIGHTS[family];
  if (!weights) {
    throw new Error("gen-tokens: no bundled weights known for font family " + JSON.stringify(family));
  }
  if (!weights.includes(weight)) {
    throw new Error(
      "gen-tokens: " + JSON.stringify(family) + " weight " + weight +
      " is requested by a type role but Phase 2 only bundles " + weights.join(", ") +
      " — either add that weight to AVAILABLE_WEIGHTS and src/design/tokens/fonts.ts, or fix the token."
    );
  }
  const name = WEIGHT_NAMES[weight];
  if (!name) throw new Error("gen-tokens: no Google-Fonts weight name known for numeric weight " + weight);
  return condensedFamilyName(family) + "_" + weight + name;
}

/* ---------------- shadows ---------------- */

export interface HardOffsetShadow {
  dx: number;
  dy: number;
  color: string;
}

/** "3px 3px 0 #14150f" -> {dx:3, dy:3, color:"#14150f"} — the blur term
    (always 0 for these "sticker" tokens — that's the whole point of the
    brand's hard-offset, blurless shadow, per ADR-003) is asserted, not
    silently dropped, so a token that stops being blurless is caught here. */
export function parseHardOffsetShadow(value: string): HardOffsetShadow {
  const parts = value.trim().split(/\s+/);
  if (parts.length !== 4) {
    throw new Error("gen-tokens: expected `<dx> <dy> <blur> <color>`, got " + JSON.stringify(value));
  }
  const [dxStr, dyStr, blurStr, color] = parts;
  const blur = pxToNumber(blurStr);
  if (blur !== 0) {
    throw new Error("gen-tokens: sticker shadow " + JSON.stringify(value) + " has a non-zero blur — ADR-003's hard-offset shadow is supposed to be blurless.");
  }
  return { dx: pxToNumber(dxStr), dy: pxToNumber(dyStr), color };
}

export interface RgbaColor {
  hex: string;
  opacity: number;
}

/** "rgba(20,21,15,.24)" -> {hex:"#14150f", opacity:0.24} — RN's shadow
    props take a solid shadowColor plus a separate shadowOpacity number,
    not a single rgba string. */
export function parseRgba(value: string): RgbaColor {
  const m = /^rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/.exec(value.trim());
  if (!m) throw new Error("gen-tokens: expected rgba(...), got " + JSON.stringify(value));
  const [, r, g, b, a] = m;
  const toHex = (n: string) => Math.round(parseFloat(n)).toString(16).padStart(2, "0");
  return { hex: "#" + toHex(r) + toHex(g) + toHex(b), opacity: parseFloat(a) };
}

export interface SoftShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  /** CSS spread has no RN shadow-prop equivalent (iOS has none; Android's
      `elevation` is a single number, not offset+blur+spread) — kept here
      for completeness/documentation, unused by any RN shadow prop. The
      only consumers (Dialog/Toast/Tooltip) are deferred past M0. */
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

/** Handles "0 6px 18px -8px rgba(...)" (offsetX offsetY blur spread color,
    the --shadow-soft/-overlay shape) AND the inset field shadow
    "inset 0 1px 0 rgba(...)" (offsetX offsetY blur color — CSS's inset
    box-shadow here carries no spread term at all, not a zero one; the two
    shapes have to be told apart by length, not assumed identical). */
export function parseSoftShadow(value: string): SoftShadow {
  let v = value.trim();
  let inset = false;
  if (v.startsWith("inset ")) {
    inset = true;
    v = v.slice("inset ".length);
  }
  const lengthRe = /(rgba\([^)]+\))$/;
  const colorMatch = lengthRe.exec(v);
  if (!colorMatch) throw new Error("gen-tokens: expected a trailing rgba(...), got " + JSON.stringify(value));
  const rgba = colorMatch[1];
  const numericPart = v.slice(0, v.length - rgba.length).trim();
  const tokens = numericPart.split(/\s+/);
  if (tokens.length !== 3 && tokens.length !== 4) {
    throw new Error("gen-tokens: expected 3 (x y blur) or 4 (x y blur spread) numbers before the color, got " + JSON.stringify(value));
  }
  const [xStr, yStr, blurStr, spreadStr] = tokens;
  const { hex, opacity } = parseRgba(rgba);
  return {
    offsetX: pxToNumber(xStr),
    offsetY: pxToNumber(yStr),
    blur: pxToNumber(blurStr),
    spread: spreadStr !== undefined ? pxToNumber(spreadStr) : 0,
    color: hex,
    opacity,
    inset,
  };
}

/* ---------------- motion ---------------- */

/** "cubic-bezier(.2,.8,.2,1)" -> [0.2, 0.8, 0.2, 1] */
export function parseCubicBezier(value: string): [number, number, number, number] {
  const m = /^cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/.exec(value.trim());
  if (!m) throw new Error("gen-tokens: expected cubic-bezier(...), got " + JSON.stringify(value));
  return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])];
}
