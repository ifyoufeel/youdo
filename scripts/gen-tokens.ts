#!/usr/bin/env node
/* Parses preview/tokens/*.css into src/design/tokens/{raw,semantic,type}.ts
   (ADR-002). After the first run those three files are canonical — this
   script's job from then on is `--check`: a CI drift gate that fails if
   they've fallen out of sync with the CSS.

   Run with:
     npm run tokens:gen     # (re)generate the three files
     npm run tokens:check   # generate in memory, diff against disk, exit 1 on drift

   All the actual parsing/conversion logic is in scripts/lib/parse-tokens.ts
   (kept pure and unit-tested); this file just wires filesystem IO around it
   and shapes the three output modules. */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
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
  parseHardOffsetShadow,
  parseSoftShadow,
  parseCubicBezier,
  type HardOffsetShadow,
  type SoftShadow,
} from "./lib/parse-tokens";

const ROOT = join(__dirname, "..");
const TOKENS_DIR = join(ROOT, "preview", "tokens");
const OUT_DIR = join(ROOT, "src", "design", "tokens");
const SOURCE_FILES = ["colors.css", "typography.css", "spacing.css", "shape.css", "motion.css"];
/* base.css is page-cascade defaults (h1, a:hover, :focus-visible...) with
   no RN equivalent, and fonts.css is just the Google Fonts CDN @import —
   neither declares --custom-properties, so neither is parsed here. */

function readAllVars(): Map<string, string> {
  const combined = SOURCE_FILES.map((f) => stripComments(readFileSync(join(TOKENS_DIR, f), "utf8"))).join("\n");
  return resolveVars(extractVars(combined));
}

function need(vars: Map<string, string>, name: string): string {
  const v = vars.get(name);
  if (v === undefined) throw new Error("gen-tokens: missing expected token --" + name);
  return v;
}

/* ---------------- raw.ts ---------------- */

function buildRaw(vars: Map<string, string>) {
  const ramp = (prefix: string, steps: string[]) =>
    Object.fromEntries(steps.map((s) => [s, need(vars, prefix + "-" + s)]));

  const color = {
    ink: ramp("ink", ["900", "800", "700", "500", "400", "300", "200", "100"]),
    paper: ramp("paper", ["000", "050", "100", "200"]),
    lime: ramp("lime", ["700", "600", "500", "300", "200", "100"]),
    coin: ramp("coin", ["600", "500", "300", "200", "100"]),
    flare: ramp("flare", ["600", "500", "300", "200", "100"]),
    success: ramp("success", ["600", "500", "200", "100"]),
    warning: ramp("warning", ["600", "500", "200", "100"]),
    danger: ramp("danger", ["600", "500", "200", "100"]),
    info: ramp("info", ["600", "500", "200", "100"]),
  };

  const space = Object.fromEntries(
    ["0", "05", "1", "15", "2", "25", "3", "4", "5", "6", "8", "10", "12", "16", "20"].map((s) => [
      s,
      pxToNumber(need(vars, "space-" + s)),
    ])
  );

  // shape.css doesn't separate "base" radii from "role" radii the way
  // colors.css separates raw ramps from semantic aliases — they're one
  // flat list in the source, so they stay one flat list here.
  const radius = Object.fromEntries(
    ["xs", "sm", "md", "lg", "xl", "2xl", "pill", "card", "card-inner", "control", "field", "sheet", "avatar"].map(
      (s) => [s, pxToNumber(need(vars, "radius-" + s))]
    )
  );

  const border = {
    hair: pxToNumber(need(vars, "border-hair")),
    width: pxToNumber(need(vars, "border-width")),
    thick: pxToNumber(need(vars, "border-thick")),
  };

  const font = {
    display: primaryFontFamily(need(vars, "font-display")),
    text: primaryFontFamily(need(vars, "font-text")),
    mono: primaryFontFamily(need(vars, "font-mono")),
  };

  const fontSize = Object.fromEntries(
    ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"].map((s) => [
      s,
      pxToNumber(need(vars, "text-" + s)),
    ])
  );

  const fontWeight = Object.fromEntries(
    ["regular", "medium", "semibold", "bold", "black"].map((s) => [s, parseInt(need(vars, "weight-" + s), 10)])
  );

  // Kept as raw unitless multipliers / em values — converting either to a
  // concrete px/pt needs a font size, which only exists per type role
  // (buildType, below). Not every role uses every one of these; buildType
  // reads whichever it needs directly off the resolved vars map.
  const lineHeight = Object.fromEntries(
    ["tight", "snug", "normal", "relaxed"].map((s) => [s, parseFloat(need(vars, "leading-" + s))])
  );
  const letterSpacing = Object.fromEntries(
    ["display", "heading", "normal", "wide", "caps"].map((s) => [
      s,
      parseFloat(need(vars, "tracking-" + s).replace("em", "")),
    ])
  );

  const duration = Object.fromEntries(
    ["instant", "fast", "base", "slow", "sheet"].map((s) => [s, msToNumber(need(vars, "duration-" + s))])
  );
  const easing = {
    out: parseCubicBezier(need(vars, "ease-out")),
    inOut: parseCubicBezier(need(vars, "ease-in-out")),
    snap: parseCubicBezier(need(vars, "ease-snap")),
  };

  // --transition-control is a composite CSS `transition` shorthand
  // (property + duration + easing, comma-joined for three properties) —
  // there's no RN equivalent to emit; a component composes the same
  // animation directly from `duration`/`easing` above via Reanimated's
  // withTiming. Deliberately not emitted as a literal token.
  const interaction = {
    pressTranslate: pxToNumber(need(vars, "press-translate")),
    hoverLift: pxToNumber(need(vars, "hover-lift")),
  };

  return { color, space, radius, border, font, fontSize, fontWeight, lineHeight, letterSpacing, duration, easing, interaction };
}

/* ---------------- semantic.ts ---------------- */

function buildSemantic(vars: Map<string, string>) {
  const color = {
    text: {
      primary: need(vars, "text-primary"),
      secondary: need(vars, "text-secondary"),
      muted: need(vars, "text-muted"),
      disabled: need(vars, "text-disabled"),
      inverse: need(vars, "text-inverse"),
      link: need(vars, "text-link"),
      danger: need(vars, "text-danger"),
      success: need(vars, "text-success"),
    },
    surface: {
      page: need(vars, "surface-page"),
      card: need(vars, "surface-card"),
      raised: need(vars, "surface-raised"),
      sunken: need(vars, "surface-sunken"),
      inverse: need(vars, "surface-inverse"),
      accent: need(vars, "surface-accent"),
      accentSoft: need(vars, "surface-accent-soft"),
      money: need(vars, "surface-money"),
      moneySoft: need(vars, "surface-money-soft"),
      hot: need(vars, "surface-hot"),
      hotSoft: need(vars, "surface-hot-soft"),
      overlay: need(vars, "surface-overlay"),
    },
    border: {
      strong: need(vars, "border-strong"),
      default: need(vars, "border-default"),
      subtle: need(vars, "border-subtle"),
    },
    focusRing: {
      ring: need(vars, "focus-ring"),
      halo: need(vars, "focus-ring-halo"),
    },
    action: {
      primary: { bg: need(vars, "action-primary-bg"), bgHover: need(vars, "action-primary-bg-hover"), bgActive: need(vars, "action-primary-bg-active"), fg: need(vars, "action-primary-fg") },
      secondary: { bg: need(vars, "action-secondary-bg"), bgHover: need(vars, "action-secondary-bg-hover"), fg: need(vars, "action-secondary-fg") },
      inverse: { bg: need(vars, "action-inverse-bg"), bgHover: need(vars, "action-inverse-bg-hover"), fg: need(vars, "action-inverse-fg") },
      danger: { bg: need(vars, "action-danger-bg"), fg: need(vars, "action-danger-fg") },
      disabled: { bg: need(vars, "action-disabled-bg"), fg: need(vars, "action-disabled-fg") },
    },
  };

  // --stroke-ink/-soft are composite `<width> solid <color>` values —
  // decomposed into {width, color} since RN takes borderWidth/borderColor
  // as separate style props, never a CSS border shorthand string.
  const strokeRe = /^([\d.]+)px solid (.+)$/;
  const parseStroke = (name: string) => {
    const m = strokeRe.exec(need(vars, name));
    if (!m) throw new Error("gen-tokens: expected `<width>px solid <color>` for --" + name);
    return { width: parseFloat(m[1]), color: m[2] };
  };
  const stroke = { ink: parseStroke("stroke-ink"), soft: parseStroke("stroke-soft") };

  const shadow: Record<string, HardOffsetShadow | SoftShadow> = {
    stickerSm: parseHardOffsetShadow(need(vars, "shadow-sticker-sm")),
    sticker: parseHardOffsetShadow(need(vars, "shadow-sticker")),
    stickerLg: parseHardOffsetShadow(need(vars, "shadow-sticker-lg")),
    stickerLime: parseHardOffsetShadow(need(vars, "shadow-sticker-lime")),
    pressed: parseHardOffsetShadow(need(vars, "shadow-pressed")),
    soft: parseSoftShadow(need(vars, "shadow-soft")),
    overlay: parseSoftShadow(need(vars, "shadow-overlay")),
    insetField: parseSoftShadow(need(vars, "shadow-inset-field")),
  };

  // The elevation ladder is just a name -> shadow lookup (plus "flat" ->
  // no shadow at all) — kept as string keys into `shadow` above rather
  // than duplicating the shadow objects.
  const elevationRaw = need(vars, "elevation-flat"); // "none" — asserted below, not otherwise used
  if (elevationRaw !== "none") throw new Error("gen-tokens: expected --elevation-flat to resolve to \"none\"");
  const elevation: Record<string, keyof typeof shadow | null> = {
    flat: null,
    card: "sticker",
    raised: "stickerLg",
    float: "soft",
    modal: "overlay",
  };

  return { color, stroke, shadow, elevation };
}

/* ---------------- type.ts ---------------- */

type TypeRole = {
  fontFamily: string;
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  fontVariant?: string[];
};

function buildType(vars: Map<string, string>) {
  /* Each role below only carries the keys typography.css actually defines
     for it — display/title/body have a full font+size+leading(+tracking)
     set, but label/caps/money don't (no --type-label-leading exists at
     all, for instance). ADR-002's own illustrative text shows `type.label`
     with a lineHeight/letterSpacing pair as an example of the *shape* the
     pattern produces, not a literal claim every role has every field —
     inventing values the source doesn't define would be worse than an
     honestly partial object, so roles are only as complete as their CSS. */
  const role = (name: string, opts: { leading?: boolean; tracking?: boolean; feature?: boolean } = {}): TypeRole => {
    const family = primaryFontFamily(need(vars, "type-" + name + "-font"));
    const weight = parseInt(need(vars, "type-" + name + "-weight"), 10);
    const fontFamily = fontModuleName(family, weight);
    const out: TypeRole = { fontFamily };

    const sizeVar = vars.get("type-" + name + "-size");
    const fontSize = sizeVar !== undefined ? pxToNumber(sizeVar) : undefined;
    if (fontSize !== undefined) out.fontSize = fontSize;

    if (opts.leading) {
      if (fontSize === undefined) throw new Error("gen-tokens: type role " + name + " wants a leading but has no size to compute it from");
      out.lineHeight = unitlessLineHeightToPx(need(vars, "type-" + name + "-leading"), fontSize);
    }
    if (opts.tracking) {
      if (fontSize === undefined) throw new Error("gen-tokens: type role " + name + " wants a tracking but has no size to compute it from");
      out.letterSpacing = emToPoints(need(vars, "type-" + name + "-tracking"), fontSize);
    }
    if (opts.feature) {
      const feature = need(vars, "type-" + name + "-feature");
      if (feature === '"tnum" 1') out.fontVariant = ["tabular-nums"];
      else throw new Error("gen-tokens: unrecognized type-" + name + "-feature value " + JSON.stringify(feature));
    }
    return out;
  };

  return {
    display: role("display", { leading: true, tracking: true }),
    title: role("title", { leading: true, tracking: true }),
    body: role("body", { leading: true }),
    label: role("label", {}),
    caps: role("caps", { tracking: true }),
    money: role("money", { feature: true }),
  };
}

/* ---------------- emit ---------------- */

const HEADER =
  `/* GENERATED by scripts/gen-tokens.ts from preview/tokens/*.css — do not\n` +
  `   hand-edit. Regenerate with \`npm run tokens:gen\`. This file IS the\n` +
  `   canonical source from here on (ADR-002) — the script's other job is\n` +
  `   \`npm run tokens:check\`, a CI drift gate against this exact content. */\n\n`;

function serialize(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  const pad1 = "  ".repeat(indent + 1);
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "number")) return "[" + value.join(", ") + "]";
    return "[\n" + value.map((v) => pad1 + serialize(v, indent + 1) + ",\n").join("") + pad + "]";
  }
  if (value === null) return "null";
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      "{\n" +
      entries.map(([k, v]) => pad1 + formatKey(k) + ": " + serialize(v, indent + 1) + ",\n").join("") +
      pad +
      "}"
    );
  }
  return JSON.stringify(value);
}

function formatKey(k: string): string {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
}

function emitModule(exportName: string, value: unknown): string {
  return HEADER + `export const ${exportName} = ${serialize(value)} as const;\n`;
}

function main() {
  const check = process.argv.includes("--check");
  const vars = readAllVars();
  const raw = buildRaw(vars);
  const semantic = buildSemantic(vars);
  const type = buildType(vars);

  const files: [string, string][] = [
    ["raw.ts", emitModule("raw", raw)],
    ["semantic.ts", emitModule("semantic", semantic)],
    ["type.ts", emitModule("type", type)],
  ];

  if (check) {
    let drift = false;
    for (const [name, content] of files) {
      const path = join(OUT_DIR, name);
      const onDisk = existsSync(path) ? readFileSync(path, "utf8") : null;
      if (onDisk !== content) {
        drift = true;
        console.error(
          onDisk === null
            ? `tokens:check — ${name} does not exist yet. Run \`npm run tokens:gen\`.`
            : `tokens:check — ${name} is out of date with preview/tokens/*.css. Run \`npm run tokens:gen\` and commit the result.`
        );
      }
    }
    if (drift) process.exit(1);
    console.log("tokens:check — src/design/tokens/*.ts matches preview/tokens/*.css, no drift.");
    return;
  }

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, content] of files) {
    writeFileSync(join(OUT_DIR, name), content);
    console.log("wrote src/design/tokens/" + name);
  }
}

main();
