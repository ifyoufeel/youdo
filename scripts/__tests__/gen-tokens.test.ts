import {
  stripComments,
  extractVars,
  resolveVars,
  pxToNumber,
  msToNumber,
  emToPoints,
  unitlessLineHeightToPx,
  primaryFontFamily,
  fontModuleName,
  condensedFamilyName,
  parseHardOffsetShadow,
  parseRgba,
  parseSoftShadow,
  parseCubicBezier,
} from "../lib/parse-tokens";

describe("stripComments", () => {
  it("removes /* ... */ blocks, including the per-line ones motion.css uses", () => {
    expect(stripComments("--a:1px; /* @kind other */\n--b:2px;")).toBe("--a:1px; \n--b:2px;");
  });
});

describe("extractVars", () => {
  it("pulls every --name:value; pair out of a :root block", () => {
    const vars = extractVars(":root{--ink-900:#14150f;--paper-000:#ffffff;}");
    expect(vars.get("ink-900")).toBe("#14150f");
    expect(vars.get("paper-000")).toBe("#ffffff");
    expect(vars.size).toBe(2);
  });

  it("doesn't choke on a quoted value containing punctuation", () => {
    const vars = extractVars(':root{--type-money-feature:"tnum" 1;}');
    expect(vars.get("type-money-feature")).toBe('"tnum" 1');
  });
});

describe("resolveVars", () => {
  it("resolves a single-level reference", () => {
    const resolved = resolveVars(new Map([["a", "var(--b)"], ["b", "red"]]));
    expect(resolved.get("a")).toBe("red");
  });

  it("resolves the real two-level chain used by --stroke-ink: border-width + solid + border-strong -> ink-900", () => {
    const resolved = resolveVars(new Map([
      ["ink-900", "#14150f"],
      ["border-strong", "var(--ink-900)"],
      ["border-width", "1.5px"],
      ["stroke-ink", "var(--border-width) solid var(--border-strong)"],
    ]));
    expect(resolved.get("stroke-ink")).toBe("1.5px solid #14150f");
  });

  it("throws on a reference to a name that never exists", () => {
    expect(() => resolveVars(new Map([["a", "var(--nope)"]]))).toThrow(/unresolved/);
  });
});

describe("pxToNumber / msToNumber", () => {
  it("strips the unit", () => {
    expect(pxToNumber("16px")).toBe(16);
    expect(pxToNumber("0px")).toBe(0);
    expect(pxToNumber("-8px")).toBe(-8);
    expect(msToNumber("140ms")).toBe(140);
  });
  it("rejects a value in the wrong unit", () => {
    expect(() => pxToNumber("16")).toThrow();
    expect(() => pxToNumber("1.5em")).toThrow();
  });
});

describe("emToPoints — ADR-002's em->points conversion", () => {
  it("matches the exact worked example from the M0 plan: tracking-display -0.03em at 48px -> -1.44", () => {
    expect(emToPoints("-0.03em", 48)).toBeCloseTo(-1.44, 5);
  });
  it("tracking-heading -0.015em at the title role's 24px -> -0.36", () => {
    expect(emToPoints("-0.015em", 24)).toBeCloseTo(-0.36, 5);
  });
  it("tracking-caps 0.09em at 12px -> 1.08", () => {
    expect(emToPoints("0.09em", 12)).toBeCloseTo(1.08, 5);
  });
});

describe("unitlessLineHeightToPx — ADR-002's unitless->rounded-px conversion", () => {
  it("leading-tight 1.04 at the display role's 48px -> round(49.92) = 50", () => {
    expect(unitlessLineHeightToPx("1.04", 48)).toBe(50);
  });
  it("leading-snug 1.18 at the title role's 24px -> round(28.32) = 28", () => {
    expect(unitlessLineHeightToPx("1.18", 24)).toBe(28);
  });
  it("leading-normal 1.45 at the body role's 16px -> round(23.2) = 23", () => {
    expect(unitlessLineHeightToPx("1.45", 16)).toBe(23);
  });
});

describe("primaryFontFamily", () => {
  it("takes the first family out of a CSS fallback stack and strips quotes", () => {
    expect(primaryFontFamily('"Bricolage Grotesque","Instrument Sans",system-ui,sans-serif')).toBe("Bricolage Grotesque");
    expect(primaryFontFamily('"Instrument Sans",system-ui,-apple-system,sans-serif')).toBe("Instrument Sans");
  });
});

describe("condensedFamilyName / fontModuleName — the family-absorbs-weight rule (ADR-002)", () => {
  it("strips spaces from the family name", () => {
    expect(condensedFamilyName("Bricolage Grotesque")).toBe("BricolageGrotesque");
  });

  it("produces the real @expo-google-fonts export name, not a naive 100->Thin..900->Black guess", () => {
    // the ADR-002 worked example, verbatim
    expect(fontModuleName("Instrument Sans", 600)).toBe("InstrumentSans_600SemiBold");
    // the important case: weight-black:800 is named ExtraBold, not Black, in
    // the real bricolage-grotesque package — this is the exact mismatch
    // Phase 2's research flagged.
    expect(fontModuleName("Bricolage Grotesque", 800)).toBe("BricolageGrotesque_800ExtraBold");
  });

  it("throws rather than emitting a fontFamily string for a weight Phase 2 doesn't bundle", () => {
    expect(() => fontModuleName("Bricolage Grotesque", 900)).toThrow(/only bundles/);
    expect(() => fontModuleName("Instrument Sans", 800)).toThrow(/only bundles/);
  });
});

describe("parseHardOffsetShadow — the ADR-003 sticker shadows", () => {
  it("parses dx/dy/color and asserts zero blur", () => {
    expect(parseHardOffsetShadow("3px 3px 0 #14150f")).toEqual({ dx: 3, dy: 3, color: "#14150f" });
    expect(parseHardOffsetShadow("5px 5px 0 var(--ink-900-resolved-already)")).toEqual(
      { dx: 5, dy: 5, color: "var(--ink-900-resolved-already)" }
    );
  });
  it("throws if a sticker shadow ever grows a blur — that would silently break ADR-003's blurless brand rule", () => {
    expect(() => parseHardOffsetShadow("3px 3px 4px #14150f")).toThrow(/blurless/);
  });
});

describe("parseRgba", () => {
  it("matches the real ink-900 rgb triple used by shadow-soft/-overlay", () => {
    expect(parseRgba("rgba(20,21,15,.24)")).toEqual({ hex: "#14150f", opacity: 0.24 });
  });
});

describe("parseSoftShadow — the blurred overlay/soft tokens", () => {
  it("parses the real --shadow-soft value", () => {
    expect(parseSoftShadow("0 6px 18px -8px rgba(20,21,15,.24)")).toEqual({
      offsetX: 0, offsetY: 6, blur: 18, spread: -8, color: "#14150f", opacity: 0.24, inset: false,
    });
  });
  it("parses the real --shadow-overlay value", () => {
    expect(parseSoftShadow("0 24px 48px -16px rgba(20,21,15,.38)")).toEqual({
      offsetX: 0, offsetY: 24, blur: 48, spread: -16, color: "#14150f", opacity: 0.38, inset: false,
    });
  });
  it("detects the inset keyword on --shadow-inset-field", () => {
    expect(parseSoftShadow("inset 0 1px 0 rgba(20,21,15,.06)")).toEqual({
      offsetX: 0, offsetY: 1, blur: 0, spread: 0, color: "#14150f", opacity: 0.06, inset: true,
    });
  });
});

describe("parseCubicBezier", () => {
  it("parses the three real easing curves", () => {
    expect(parseCubicBezier("cubic-bezier(.2,.8,.2,1)")).toEqual([0.2, 0.8, 0.2, 1]);
    expect(parseCubicBezier("cubic-bezier(.5,0,.5,1)")).toEqual([0.5, 0, 0.5, 1]);
    expect(parseCubicBezier("cubic-bezier(.34,1.5,.64,1)")).toEqual([0.34, 1.5, 0.64, 1]);
  });
});
