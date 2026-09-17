# Self-check

The design system and the content rules only stay true if something checks
them. `test/rules.js` does, against the built preview rather than against
memory, and fails the suite if any of it drifts.

## What is checked, and where the rule comes from

| Check | Rule |
|---|---|
| Every `var(--token)` used is declared in `tokens/*.css` | ADR-002 — the TypeScript/CSS token module is canonical |
| No raw hex or `rgb()` in screen code | ADR-002 |
| `Intl.NumberFormat` appears nowhere | PRD §11 — `formatMoney` is the only formatting boundary |
| The fixture stores integer minor units, never formatted strings or floats | PRD §11, ADR-005 |
| Every icon name resolves to the 47-glyph set | M0 |
| No emoji in any user-facing string | PRD §12 |
| Uppercase only on `Badge` and the 12px meta eyebrow | PRD §12 |
| Button labels ≤ 18 characters; no "Submit", "Continue", "Learn more" | PRD §12 |
| Quest titles open with a verb | PRD §12 |
| Every control has text or an accessible label | PRD §10 |
| `paper-on-flare` is never used at body scale | PRD §10 |

## What this pass found

Three things, of which one was real.

**Real — paper-on-flare failed AA in three places.** The Badge "hot" tone and
the two notification counters put `--paper-000` on `--flare-500` at 10–12px:
3.11:1 against the 4.5:1 AA needs. Fixed to ink on flare (5.90:1), which also
matches how the system's other bright fills already work. See ADR-010. The fix
is in the published `ds-bundle.js` and needs carrying back to its source.

**Not real — an arrow in a comment.** The emoji detector was catching `→` in
prose and source comments. Typographic arrows are punctuation the system uses
deliberately; the detector now looks at string literals only, and only at
pictographic ranges.

**Not real, but it changed the code anyway — the eyebrow's `font` shorthand.**
The uppercase check flagged 68 legitimate eyebrows because their size was folded
into a `font:` shorthand it could not read. The checker now parses the
shorthand — but the eyebrow was rewritten longhand too, because a rule that is
hard to check is a rule that quietly stops being true.

## What a checker cannot see

**jsdom does no layout.** These suites drive real clicks and read real text, so
they catch behaviour, guards and copy. They cannot catch overflow. A pass in a
real browser found two things they had no chance of finding: the offer row's
four actions overflowing a 390px card, and the preview clock wrapping onto a
second line. Run a browser pass before signing off on a screen — and per
ADR-001, typography and gestures are signed off on a device, not on the web.

**Contrast is checked at one pairing, not all.** The rule here is narrow: the
one pairing the PRD already named. A full audit of every fill against every
text colour in the system has not been done.
