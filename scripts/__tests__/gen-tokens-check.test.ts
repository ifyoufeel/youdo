/* Integration test for the `tokens:check` CI drift gate ADR-002 asks for:
   generation should be idempotent (gen twice, get the same bytes), and
   `--check` must fail loudly the moment src/design/tokens/*.ts drifts from
   preview/tokens/*.css — that's the whole point of committing generated
   output instead of generating it at build time.

   Runs entirely against a disposable temp directory (GEN_TOKENS_ROOT),
   never the real committed preview/tokens/*.css or src/design/tokens/*.ts
   — corrupting the real files in place, even briefly and even restored
   afterward, raced with other test files importing type.ts concurrently
   under Jest's parallel workers and actually broke a CI run this way. */
import { execFileSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, mkdtempSync, mkdirSync, rmSync, cpSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const ROOT = join(__dirname, "..", "..");
const GEN_TOKENS = join(ROOT, "scripts", "gen-tokens.ts");
const REAL_TOKENS_DIR = join(ROOT, "preview", "tokens");
const SOURCE_FILES = ["colors.css", "typography.css", "spacing.css", "shape.css", "motion.css"];

let tempRoot: string;

beforeEach(() => {
  tempRoot = mkdtempSync(join(tmpdir(), "gen-tokens-test-"));
  const tempTokensDir = join(tempRoot, "preview", "tokens");
  mkdirSync(tempTokensDir, { recursive: true });
  for (const f of SOURCE_FILES) {
    cpSync(join(REAL_TOKENS_DIR, f), join(tempTokensDir, f));
  }
});

afterEach(() => {
  rmSync(tempRoot, { recursive: true, force: true });
});

function run(args: string[]): { status: number; output: string } {
  try {
    const output = execFileSync("npx", ["tsx", GEN_TOKENS, ...args], {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, GEN_TOKENS_ROOT: tempRoot },
    });
    return { status: 0, output };
  } catch (e) {
    const err = e as { status: number; stdout?: string; stderr?: string };
    return { status: err.status, output: (err.stdout || "") + (err.stderr || "") };
  }
}

describe("tokens:gen / tokens:check (ADR-002's CI drift gate)", () => {
  it("generates src/design/tokens/*.ts and --check then reports no drift", () => {
    const typeTs = join(tempRoot, "src", "design", "tokens", "type.ts");
    const gen = run([]);
    expect(gen.status).toBe(0);
    expect(existsSync(typeTs)).toBe(true);

    const check = run(["--check"]);
    expect(check.status).toBe(0);
    expect(check.output).toMatch(/no drift/);
  }, 30000);

  it("regenerating produces byte-identical output — the generator is deterministic", () => {
    const typeTs = join(tempRoot, "src", "design", "tokens", "type.ts");
    run([]);
    const before = readFileSync(typeTs, "utf8");
    run([]);
    const after = readFileSync(typeTs, "utf8");
    expect(after).toBe(before);
  }, 30000);

  it("--check fails the moment the committed file drifts from the CSS source", () => {
    const typeTs = join(tempRoot, "src", "design", "tokens", "type.ts");
    run([]);
    const original = readFileSync(typeTs, "utf8");
    writeFileSync(typeTs, original.replace("InstrumentSans_400Regular", "SomeOtherFont_400Regular"));

    const check = run(["--check"]);
    expect(check.status).toBe(1);
    expect(check.output).toMatch(/out of date/);
  }, 30000);
});
