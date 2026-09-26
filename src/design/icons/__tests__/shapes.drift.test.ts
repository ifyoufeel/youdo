/* shapes.ts was extracted from preview/ds-bundle.js's `const P = {...}`
   table (programmatically, not hand-transcribed — see the generation note
   in shapes.ts). This test re-extracts that same object straight from the
   live source on every run and deep-compares it against ICON_SHAPES, so a
   future edit to the web icon set doesn't silently drift from what RN
   renders — the same "generated output committed, drift caught by a
   test" pattern as scripts/gen-tokens.ts's tokens:check. */
import { readFileSync } from "fs";
import { join } from "path";
import { ICON_SHAPES } from "../shapes";

function extractPTable(): Record<string, unknown> {
  const src = readFileSync(join(__dirname, "..", "..", "..", "..", "preview", "ds-bundle.js"), "utf8");
  const start = src.indexOf("const P = {");
  if (start === -1) throw new Error("shapes drift test: `const P = {` not found in preview/ds-bundle.js — did Icon.jsx's source move?");
  const braceStart = src.indexOf("{", start);
  let depth = 0;
  let end = braceStart;
  for (; end < src.length; end++) {
    if (src[end] === "{") depth++;
    else if (src[end] === "}") {
      depth--;
      if (depth === 0) {
        end++;
        break;
      }
    }
  }
  const objectLiteral = src.slice(braceStart, end);
  // Trusted first-party source (this repo's own preview/), a plain object
  // literal of string/number arrays — evaluated the same way gen-tokens.ts
  // already trusts this file's own CSS custom properties.
  return eval("(" + objectLiteral + ")");
}

describe("Icon shapes stay in sync with preview/ds-bundle.js", () => {
  it("ICON_SHAPES is byte-for-byte the same geometry as the web Icon component's P table", () => {
    const live = extractPTable();
    expect(Object.keys(live).sort()).toEqual(Object.keys(ICON_SHAPES).sort());
    for (const name of Object.keys(live)) {
      expect(ICON_SHAPES[name as keyof typeof ICON_SHAPES]).toEqual(live[name]);
    }
  });
});
