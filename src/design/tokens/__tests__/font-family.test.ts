import { fontFamilyName, WEIGHT_NAMES } from "../font-family";
import { WEIGHT_NAMES as GEN_WEIGHT_NAMES } from "../../../../scripts/lib/parse-tokens";

describe("font-family.ts's WEIGHT_NAMES stays identical to gen-tokens' copy", () => {
  it("the two hand-kept tables never drift apart", () => {
    expect(WEIGHT_NAMES).toEqual(GEN_WEIGHT_NAMES);
  });
});

describe("fontFamilyName", () => {
  it("matches the ADR-002 worked example", () => {
    expect(fontFamilyName("Instrument Sans", 600)).toBe("InstrumentSans_600SemiBold");
  });

  it("matches Button's own bold Instrument Sans", () => {
    expect(fontFamilyName("Instrument Sans", 700)).toBe("InstrumentSans_700Bold");
  });

  it("throws for a weight nothing bundles", () => {
    expect(() => fontFamilyName("Instrument Sans", 900)).toThrow(/not a bundled font asset/);
  });
});
