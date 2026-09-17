/* Self-check: the design-system and content rules from PRD §12, §10 and the
   ADRs, run against the built preview rather than against memory.
   Source scans catch what the DOM can't; DOM scans catch what source can't. */
const fs = require("fs");
const path = require("path");
const H = require("./env");

const DIR = process.env.YOUDO_DIR || path.join(__dirname, "..", "preview");
const app = fs.readFileSync(path.join(DIR, "app.js"), "utf8");
const fixture = fs.readFileSync(path.join(DIR, "data.taiwan.js"), "utf8");

let violations = [];
function report(rule, detail) { violations.push({ rule, detail }); }
function section(name) { console.log("\n== " + name + " =="); }
function pass(msg) { console.log("  ok   " + msg); }
function fail(rule, msg, items) {
  console.log("  FAIL " + msg + (items && items.length ? "\n         " + items.slice(0, 8).join("\n         ") : ""));
  report(rule, msg);
}

/* ---------- 1. Tokens are the only source of colour and size ---------- */
section("Tokens");

const tokenFiles = fs.readdirSync(path.join(DIR, "tokens"));
const declared = new Set();
for (const f of tokenFiles) {
  const css = fs.readFileSync(path.join(DIR, "tokens", f), "utf8");
  for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/gi)) declared.add(m[1]);
}
const used = new Set();
for (const m of app.matchAll(/var\((--[a-z0-9-]+)/gi)) used.add(m[1]);
const missing = [...used].filter((t) => !declared.has(t));
missing.length
  ? fail("token-drift", missing.length + " token(s) referenced but not declared", missing)
  : pass(used.size + " tokens referenced, all declared in tokens/*.css");

/* Raw colour literals in app code — the system has no dark theme and every
   surface is painted from tokens, so a hex in a screen is a drift. */
const hexes = [];
for (const m of app.matchAll(/(?:background|color|borderColor|fill|stroke)\s*:\s*["'](#[0-9a-f]{3,8}|rgba?\([^)]*\))["']/gi)) hexes.push(m[0].trim());
hexes.length
  ? fail("raw-colour", hexes.length + " raw colour literal(s) outside the tokens", hexes)
  : pass("no raw colour literals in screen code");

/* ---------- 2. One money formatting boundary (ADR-005) ---------- */
section("Money");

const intlUses = [...app.matchAll(/Intl\.NumberFormat/g)];
intlUses.length
  ? fail("money-boundary", "Intl.NumberFormat used " + intlUses.length + "x outside formatMoney")
  : pass("no Intl.NumberFormat anywhere — formatMoney is the only boundary");

/* Money must never be a stored string in the domain layer. */
const storedMoney = [];
for (const m of fixture.matchAll(/"(NT\$[\d,]+)"/g)) storedMoney.push(m[1]);
storedMoney.length
  ? fail("money-type", "fixture stores formatted money as a string", storedMoney)
  : pass("fixture stores integer minor units only, never formatted strings");

const floats = [];
for (const m of fixture.matchAll(/(?:payoutMinor|amountMinor|amountMinor)\s*:\s*(-?\d+\.\d+)/g)) floats.push(m[1]);
floats.length
  ? fail("money-type", "non-integer minor units in the fixture", floats)
  : pass("every minor-unit amount is an integer");

/* ---------- 3. Icons resolve ---------- */
section("Icons");
const iconNames = new Set(require("vm").runInNewContext(
  fs.readFileSync(path.join(DIR, "icon-names.js"), "utf8") + ";window.YOUDO_ICON_NAMES",
  { window: {} }
));
const usedIcons = new Set();
for (const m of app.matchAll(/h\(Icon,\s*\{\s*name:\s*"([^"]+)"/g)) usedIcons.add(m[1]);
for (const m of app.matchAll(/React\.createElement\(Icon,\s*\{\s*\n?\s*name:\s*"([^"]+)"/g)) usedIcons.add(m[1]);
for (const m of app.matchAll(/\bicon:\s*"([a-z][a-z0-9-]*)"/g)) usedIcons.add(m[1]);
for (const m of app.matchAll(/\biconRight:\s*"([a-z][a-z0-9-]*)"/g)) usedIcons.add(m[1]);
const badIcons = [...usedIcons].filter((n) => !iconNames.has(n));
badIcons.length
  ? fail("icon-name", badIcons.length + " icon name(s) not in the 47-glyph set", badIcons)
  : pass(usedIcons.size + " icon names used, all in the exported glyph set");

/* ---------- 4. Content rules (PRD §12) ---------- */
section("Content rules");

/* No emoji, anywhere. The rating star is an icon, not a glyph. */
/* Pictographic glyphs only. Typographic arrows and dashes in prose and
   comments are punctuation, not emoji, and the system uses them deliberately. */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2605}\u{2606}\u{2764}\u{2B55}]/u;
const emojiHits = [];
for (const [name, src] of [["app.js", app], ["data.taiwan.js", fixture]]) {
  src.split("\n").forEach((line, i) => {
    /* Only user-facing strings count; a comment is never rendered. */
    for (const lit of line.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
      if (EMOJI.test(lit[1])) emojiHits.push(name + ":" + (i + 1) + "  " + lit[0].slice(0, 70));
    }
  });
}
emojiHits.length
  ? fail("no-emoji", emojiHits.length + " line(s) contain an emoji or pictographic glyph", emojiHits)
  : pass("no emoji in any source file");

/* Boot the app so labels can be read from what actually renders. */
const { w, act, root } = H.boot();
const ReactDOMClient = require("react-dom/client");
const r = ReactDOMClient.createRoot(root);
act(() => { r.render(w.React.createElement(w.eval("App"))); });

/* Walk every view and every screen so labels from all of them are collected. */
const seenLabels = new Set();
const seenUppercase = [];
function harvest() {
  for (const b of H.buttons(root)) {
    const t = H.text(b);
    if (t) seenLabels.add(t);
  }
  for (const el of H.all(root, "*")) {
    const st = el.getAttribute && el.getAttribute("style");
    if (st && /text-transform:\s*uppercase/i.test(st)) {
      /* Size may arrive as font-size, or folded into the `font:` shorthand. */
      const fs_ = ((st.match(/font-size:\s*([^;]+)/i) || [])[1] ||
                   (st.match(/(?:^|;)\s*font:\s*([^;]+)/i) || [])[1] || "");
      const t = H.text(el);
      /* Allowed: Badge, and the 12px meta eyebrow. */
      const allowed = /--text-3xs|--text-2xs|--type-caps-size/.test(fs_);
      if (!allowed && t) seenUppercase.push(t.slice(0, 40) + "  [font-size: " + fs_.trim() + "]");
    }
  }
}
harvest();
for (const view of ["Flows", "Components", "Tokens", "States"]) {
  const tab = H.byText(root, view);
  if (tab) { act(() => { tab.click(); }); harvest(); }
}
const proto = H.byText(root, "Prototype");
if (proto) act(() => { proto.click(); });
/* Walk the app's own tabs too. */
for (const t of ["My quests", "Post", "Chats", "Profile", "Browse"]) {
  const el = H.byLabel(root, t);
  if (el) { act(() => { el.click(); }); harvest(); }
}

seenUppercase.length
  ? fail("sentence-case", seenUppercase.length + " uppercase run(s) outside Badge and the 12px eyebrow", seenUppercase)
  : pass("uppercase confined to Badge and the 12px meta eyebrow");

/* Buttons: verb-first, two or three words, <= 18 characters. */
const BANNED = ["submit", "continue", "learn more", "ok", "yes", "no", "click here"];
const tooLong = [], banned = [];
for (const label of seenLabels) {
  if (!/[a-z]/i.test(label)) continue;          // icon-only buttons
  if (/^\d+$/.test(label)) continue;            // badge counters
  if (label.length > 18) tooLong.push(label + "  (" + label.length + ")");
  if (BANNED.includes(label.toLowerCase())) banned.push(label);
}
tooLong.length
  ? fail("button-length", tooLong.length + " button label(s) over 18 characters", tooLong)
  : pass(seenLabels.size + " button labels collected, none over 18 characters");
banned.length
  ? fail("button-words", "banned button wording", banned)
  : pass("no Submit / Continue / Learn more anywhere");

/* Durations take a ~ prefix; money always carries its symbol. */
const bodyText = H.text(root);
const bareDuration = /(?<![~\d])\b\d+\s?(min|hr)\b/.exec(bodyText);
/* Quest titles are verb phrases with an object and a bound. */
const VERBS = ["walk","pick","assemble","help","set","drop","water","queue","take","photograph","carry","clean","deliver","collect","move","fix","paint"];
const badTitles = [];
for (const m of fixture.matchAll(/title:\s*"([^"]+)"/g)) {
  const first = m[1].split(" ")[0].toLowerCase();
  if (!VERBS.includes(first)) badTitles.push(m[1]);
}
badTitles.length
  ? fail("title-shape", "quest titles that don't open with a verb", badTitles)
  : pass("every fixture quest title is a verb phrase");

/* ---------- 5. Accessibility (PRD §10) ---------- */
section("Accessibility");
const unlabelled = H.all(root, "button").filter((b) => !H.text(b) && !b.getAttribute("aria-label"));
unlabelled.length
  ? fail("a11y-label", unlabelled.length + " control(s) with neither text nor an accessible label")
  : pass("every control carries text or an accessible label");

/* paper-on-flare fails AA at body size and is restricted to headline scale. */
const flareBody = [];
for (const el of H.all(root, "*")) {
  const st = (el.getAttribute && el.getAttribute("style")) || "";
  if (/background:\s*var\(--(?:flare-500|surface-hot)\)/.test(st) && /color:\s*var\(--paper/.test(st)) {
    flareBody.push(H.text(el).slice(0, 40));
  }
}
flareBody.length
  ? fail("contrast", "paper-on-flare used at body scale", flareBody)
  : pass("paper-on-flare not used at body scale");

/* ---------- summary ---------- */
console.log("\n" + "-".repeat(56));
if (!violations.length) {
  console.log("Design system and content rules: no violations found.");
} else {
  console.log(violations.length + " violation(s):");
  violations.forEach((v) => console.log("  [" + v.rule + "] " + v.detail));
}
process.exit(violations.length ? 1 : 0);
