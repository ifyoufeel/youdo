import { stickerGeometry } from "./sticker-math";
import { semantic } from "../tokens/semantic";

describe("stickerGeometry — the default (md) elevation matches the real web components exactly", () => {
  it("rest == --shadow-sticker's own dx/dy, no translate", () => {
    expect(stickerGeometry("md", "rest")).toEqual({
      shadowDx: semantic.shadow.sticker.dx,
      shadowDy: semantic.shadow.sticker.dy,
      contentTranslateX: 0,
      contentTranslateY: 0,
    });
  });

  it("hover == --shadow-sticker-lg's dx/dy, translate(-1,-1) — ds-bundle.js Card:1657/Button:109-110, hardcoded, not scaled from the base", () => {
    expect(stickerGeometry("md", "hover")).toEqual({
      shadowDx: semantic.shadow.stickerLg.dx,
      shadowDy: semantic.shadow.stickerLg.dy,
      contentTranslateX: -1,
      contentTranslateY: -1,
    });
  });

  it("press == --shadow-pressed's dx/dy, translate(2,2) — same hardcoded pattern", () => {
    expect(stickerGeometry("md", "press")).toEqual({
      shadowDx: semantic.shadow.pressed.dx,
      shadowDy: semantic.shadow.pressed.dy,
      contentTranslateX: 2,
      contentTranslateY: 2,
    });
  });
});

describe("stickerGeometry — every (elevation, state) combination", () => {
  const cases: [
    Parameters<typeof stickerGeometry>[0],
    Parameters<typeof stickerGeometry>[1],
    ReturnType<typeof stickerGeometry>
  ][] = [
    ["sm", "rest", { shadowDx: 2, shadowDy: 2, contentTranslateX: 0, contentTranslateY: 0 }],
    ["sm", "hover", { shadowDx: 4, shadowDy: 4, contentTranslateX: -1, contentTranslateY: -1 }],
    ["sm", "press", { shadowDx: 1, shadowDy: 1, contentTranslateX: 2, contentTranslateY: 2 }], // floors at 1, doesn't go to 0
    ["md", "rest", { shadowDx: 3, shadowDy: 3, contentTranslateX: 0, contentTranslateY: 0 }],
    ["md", "hover", { shadowDx: 5, shadowDy: 5, contentTranslateX: -1, contentTranslateY: -1 }],
    ["md", "press", { shadowDx: 1, shadowDy: 1, contentTranslateX: 2, contentTranslateY: 2 }],
    ["lg", "rest", { shadowDx: 5, shadowDy: 5, contentTranslateX: 0, contentTranslateY: 0 }],
    ["lg", "hover", { shadowDx: 7, shadowDy: 7, contentTranslateX: -1, contentTranslateY: -1 }],
    ["lg", "press", { shadowDx: 3, shadowDy: 3, contentTranslateX: 2, contentTranslateY: 2 }],
  ];

  it.each(cases)("elevation=%s state=%s -> %o", (elevation, state, expected) => {
    expect(stickerGeometry(elevation, state)).toEqual(expected);
  });
});

describe("stickerGeometry — invariants that matter for the brand feel, not just specific numbers", () => {
  const elevations: Parameters<typeof stickerGeometry>[0][] = ["sm", "md", "lg"];

  it("press always shrinks the gap relative to rest — 'pushes into paper', never grows it", () => {
    for (const e of elevations) {
      const rest = stickerGeometry(e, "rest");
      const press = stickerGeometry(e, "press");
      expect(press.shadowDx).toBeLessThan(rest.shadowDx);
    }
  });

  it("hover always grows the gap relative to rest — 'lifts off the page'", () => {
    for (const e of elevations) {
      const rest = stickerGeometry(e, "rest");
      const hover = stickerGeometry(e, "hover");
      expect(hover.shadowDx).toBeGreaterThan(rest.shadowDx);
    }
  });

  it("the gap never collapses to (or past) zero on press — the sticker never fully flattens", () => {
    for (const e of elevations) {
      expect(stickerGeometry(e, "press").shadowDx).toBeGreaterThanOrEqual(1);
    }
  });

  it("shadow offset is always square (dx == dy) — these are diagonal offsets, never directional", () => {
    for (const e of elevations) {
      for (const s of ["rest", "hover", "press"] as const) {
        const g = stickerGeometry(e, s);
        expect(g.shadowDx).toBe(g.shadowDy);
      }
    }
  });

  it("content translate magnitude is fixed across every elevation — only the shadow itself scales", () => {
    for (const e of elevations) {
      expect(stickerGeometry(e, "hover")).toMatchObject({ contentTranslateX: -1, contentTranslateY: -1 });
      expect(stickerGeometry(e, "press")).toMatchObject({ contentTranslateX: 2, contentTranslateY: 2 });
    }
  });
});
