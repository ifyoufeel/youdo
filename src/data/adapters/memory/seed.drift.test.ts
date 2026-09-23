/* seed.ts was extracted from preview/data.taiwan.js's IIFE (evaluated
   directly, not hand-transcribed). This test re-extracts that same object
   from the live source on every run and deep-compares it against the
   committed seed.ts — the same generated-output-plus-drift-test pattern
   as gen-tokens.ts's tokens:check and shapes.drift.test.ts, so a future
   edit to the preview's fixture can't silently drift from what the real
   app's memory adapter reads. */
import { readFileSync } from "fs";
import { join } from "path";
import { seed } from "./seed";

function extractFixture(): unknown {
  let src = readFileSync(join(__dirname, "..", "..", "..", "..", "preview", "data.taiwan.js"), "utf8");
  src = src.replace(/^\/\*[\s\S]*?\*\/\s*/, "");
  src = src.replace(/^window\.YOUDO_DATA = /, "");
  src = src.replace(/;\s*$/, "");
  // Trusted first-party source, the same call gen-tokens.ts and
  // shapes.drift.test.ts already make about this repo's own preview/.
  return eval(src);
}

describe("memory adapter seed stays in sync with preview/data.taiwan.js", () => {
  it("seed is byte-for-byte the same fixture the preview ships", () => {
    const live = extractFixture();
    expect(seed).toEqual(live);
  });
});
