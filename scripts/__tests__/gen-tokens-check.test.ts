/* Integration test for the `tokens:check` CI drift gate ADR-002 asks for:
   generation should be idempotent (gen twice, get the same bytes), and
   `--check` must fail loudly the moment src/design/tokens/*.ts drifts from
   preview/tokens/*.css — that's the whole point of committing generated
   output instead of generating it at build time. */
import { execFileSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "..", "..");
const GEN_TOKENS = join(ROOT, "scripts", "gen-tokens.ts");
const TYPE_TS = join(ROOT, "src", "design", "tokens", "type.ts");

function run(args: string[]): { status: number; output: string } {
  try {
    const output = execFileSync("npx", ["tsx", GEN_TOKENS, ...args], { cwd: ROOT, encoding: "utf8" });
    return { status: 0, output };
  } catch (e) {
    const err = e as { status: number; stdout?: string; stderr?: string };
    return { status: err.status, output: (err.stdout || "") + (err.stderr || "") };
  }
}

describe("tokens:gen / tokens:check (ADR-002's CI drift gate)", () => {
  it("generates src/design/tokens/*.ts and --check then reports no drift", () => {
    const gen = run([]);
    expect(gen.status).toBe(0);
    expect(existsSync(TYPE_TS)).toBe(true);

    const check = run(["--check"]);
    expect(check.status).toBe(0);
    expect(check.output).toMatch(/no drift/);
  }, 30000);

  it("regenerating produces byte-identical output — the generator is deterministic", () => {
    const before = readFileSync(TYPE_TS, "utf8");
    run([]);
    const after = readFileSync(TYPE_TS, "utf8");
    expect(after).toBe(before);
  }, 30000);

  it("--check fails the moment the committed file drifts from the CSS source", () => {
    const original = readFileSync(TYPE_TS, "utf8");
    try {
      writeFileSync(TYPE_TS, original.replace("InstrumentSans_400Regular", "SomeOtherFont_400Regular"));
      const check = run(["--check"]);
      expect(check.status).toBe(1);
      expect(check.output).toMatch(/out of date/);
    } finally {
      // Restore — this test must never leave the canonical file corrupted.
      writeFileSync(TYPE_TS, original);
    }
  }, 30000);
});
