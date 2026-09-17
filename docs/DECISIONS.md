# YouDO — Architecture Decision Log

Short records of settled decisions, so they don't get re-argued. Each states the choice, why, what it costs, and what would make us revisit it.

---

## ADR-001 · Expo + Expo Router, one codebase for mobile and web

**Decision.** Expo (New Architecture) + Expo Router + TypeScript strict. The web app is the same codebase exported via `expo export -p web` (react-native-web), not a separate application.

**Why.** Mobile is the primary experience and a web app is required at launch. Expo Router gives file-based routing that produces both from one tree, so every feature — and the preview gallery — reaches the web at roughly zero marginal cost per milestone. A separate Next.js app would mean building and maintaining a second UI layer for every screen.

**Cost.** The web output is an app-like SPA: public quest pages won't rank in search, and first load is heavier than a server-rendered site. Web previews are also not pixel-identical to native (shadows, text metrics, gestures), so sign-off on typography and interaction happens on device.

**Revisit if.** Organic search becomes a meaningful acquisition channel. `src/design` and `src/data` are deliberately framework-free so a Next.js surface can be added for indexable pages without touching the app.

**Rejected.** Bare React Native CLI (loses EAS, OTA updates and web export for nothing). Flutter (discards ~1,000 lines of working React). Adding Next.js now (pays for the web app before it's needed).

---

## ADR-002 · Plain TypeScript token module, no styling library

**Decision.** `scripts/gen-tokens.ts` parses `project/tokens/*.css` into `src/design/tokens/{raw,semantic,type}.ts`, preserving the existing two-tier structure. After the first run **the TypeScript module is canonical** and the script becomes a CI drift check. Styling is `StyleSheet.create` plus typed token objects.

**Why.** The design system is already inline-style-shaped: no classNames, no cascade, no CSS pseudo-classes, variants already expressed as plain maps, and hover/press already driven by `useState`. A utility framework would add a Babel/Metro transform and a second mental model to buy features this system doesn't use.

**Three conversions belong in the tokens, never in components:**
- `"16px"` → `16`
- `letterSpacing: -0.03em` → points (`em × fontSize`)
- unitless `lineHeight: 1.45` → `round(1.45 × fontSize)`
- **Font family absorbs weight** — RN cannot synthesise weight across a family, so `type.label` returns `{ fontFamily: "InstrumentSans_600SemiBold", fontSize, lineHeight, letterSpacing }` as one unit.

**Cost.** Verbose style objects, no free theme switching, styles maintained by hand.

**Revisit if.** Dark mode ships — Unistyles' no-re-render theming would then earn its keep.

**Rejected.** NativeWind (its value is class ergonomics and pseudo-class variants; we use neither). Unistyles (headline feature is theming; we have one static theme). Tamagui (ships a component library competing with our 22). Restyle (re-encodes variant maps we already have — a lateral move).

---

## ADR-003 · Sticker shadow as a duplicated offset View

**Decision.** The brand's hard offset shadow is rendered as an absolutely-positioned sibling View behind the element — same size and radius, filled ink, translated by the offset. Everything goes through one `<Sticker elevation color>` component. Genuinely blurred tokens (`--shadow-soft`, `--shadow-overlay`) use native shadow props instead.

**Why.** Android's `elevation` produces a blurred, symmetric Material shadow — visually wrong for this brand, which is built on zero-blur offsets. The decisive factor is animation: RN's `boxShadow` prop is a **string and not interpolatable by Reanimated**, so the press interaction would be a discrete jump. With a separate shadow layer we animate only the content's translate, and the 3px gap collapses to 1px continuously — which is exactly the brief's "the element pushes into the paper".

**Cost.** One extra view per shadowed element, which matters in long lists.

**Watch.** `Card` sets `overflow: hidden` for its media block — the `Sticker` wrapper must sit *outside* the clipping view or it clips its own shadow.

**Revisit if.** Feed scroll performance suffers. Because everything routes through `<Sticker>`, switching to the `boxShadow` prop is a one-file change.

---

## ADR-004 · Ports and adapters for all data, TanStack Query on top

**Decision.** `src/data/contracts` (types + zod) → `src/data/ports` (interfaces) → `src/data/adapters/{memory,supabase}`. A composition root selects the adapter by env flag; a React context supplies it. TanStack Query v5 handles caching, infinite feeds, optimistic mutations and retry.

**Why.** The database is deliberately the *last* milestone. That only works if the swap touches no feature code.

**Non-negotiable from day one**, even though the memory adapter ignores most of it:
- every method `async`
- cursor pagination
- a `subscribe()` shape (realtime is what would otherwise force a rewrite at M7)
- geo parameters in `listQuests({ center, radiusM, cursor })`
- `idempotencyKey` on mutations

**Keeping the mock honest.** Every memory method awaits a jittered 120–400ms delay, and a fault-injection switch in the preview UI forces error paths. A secretly-synchronous mock would hide every loading and error state until the swap broke them all at once.

**Enforcement.** ESLint forbids importing `data/adapters/*` anywhere but the composition root.

---

## ADR-005 · Money as integer minor units with a derived-balance ledger

**Decision.** `Money = { minor: number; currency: 'TWD' }` — integer minor units, branded, never float, never a formatted string in the domain. One formatting boundary (`formatMoney`). An append-only, double-entry-lite ledger across five named accounts: `user_available`, `user_held`, `platform_escrow`, `platform_fee`, `external_bank`. **Balances are always derived by summation, never stored as a mutable field.**

**Why.** The prototype has no arithmetic anywhere — every amount is a preformatted string. Derived balances are what make the eventual Stripe swap non-destructive: the ledger stays ours, and Stripe becomes only the funding and settlement adapter behind `PaymentsPort { authorize, capture, refund, payout }`.

**Detail that matters.** Every payment passes through `pending` **even in the mock**, because Stripe's real transitions are webhook-driven. A mock that resolves synchronously would model a world that doesn't exist.

**Invariant.** Entries per transaction sum to zero, enforced by test. Fees round as `round(minor * bps / 10000)` with the remainder favouring the doer.

**TWD note.** Nominally two-decimal, transacted in whole dollars — display omits zero minor units (`NT$400`, not `NT$400.00`).

---

## ADR-006 · Taiwan market, TWD, English at launch with i18n seams

**Decision.** Launch in Taipei, price in TWD, ship English-only copy — but route every user-facing string through an i18n layer from M1.

**Why.** The source material contradicted itself (pounds sterling against Berlin addresses), so both were replaced. English-only keeps the design system's content rulebook intact: its casing rules, the ≤18-character button limit and the +9% caps tracking are all built for a cased alphabet, and none of the three brand fonts contain a single CJK glyph.

**Cost, stated plainly.** An English-only consumer marketplace in Taiwan limits reach on both sides of a market that depends on local density. This is a known risk, accepted for launch.

**Revisit at M6.** Adding Traditional Chinese needs a CJK face paired with the Latin fonts (numbers and the wordmark stay in the display face), and a zh-TW addendum replacing the casing section of the content rules. The i18n seam exists so this is a translation pass, not a refactor.

---

## ADR-007 · Google sign-in plus 6-digit OTP

**Decision.** Google OAuth, and a 6-digit one-time code to email or phone. No passwords, no LINE at launch.

**Why.** Simplest for users and for us; all three are native Supabase Auth capabilities. LINE dominates Taiwan and would reduce sign-up drop-off, but Supabase has no built-in provider — it needs a custom OIDC integration, which is real work rather than configuration.

**Consequences.**
- **Sign in with Apple becomes mandatory** for App Store review once any third-party social login ships. Budgeted into M8 as a blocker, not an enhancement.
- SMS OTP costs money per send and needs a third-party provider for Taiwan. **Email OTP is the development default.**

---

## ADR-008 · The preview rail is a product surface, not a dev tool

**Decision.** `app/(preview)/` ships in every build, backed by a registry of co-located `*.preview.tsx` files: **components** (every variant and state), **screens** (empty / loading / error / full / long-content), **flows** (scripted two-sided walkthroughs), **tokens** (palette, type, shadow specimens). Plus a dev-only actor switcher and the repository fault-injection switch.

**Why.** Every milestone has to be reviewable in isolation, and the prototype's biggest weakness was invisible states — exactly one empty state existed across five screens, and no loading or error state anywhere. Making state coverage a routed, browsable surface forces those states to get built instead of skipped.

**The actor switcher is not optional.** YouDO is two-sided; a poster-side offer inbox cannot be reviewed at all without flipping identity.

**Delivery.** Two surfaces per milestone — EAS Update preview channel on device, Vercel static export as a shareable link. The web link is a review aid; typography, shadows and gestures are signed off on device.

**Acceptance.** The M0 component gallery is diffed against the existing `project/**/*.card.html` renders — the web design system becomes the port's acceptance test rather than dead reference material.

---

## ADR-009 · The preview owns an actor switcher and a movable clock

**Decision.** `app/(preview)/` carries two controls that ship in the preview and
never in the product: a switcher that changes which of the six seeded people you
are, and three buttons that move the preview's clock forward by an hour, a day
or three days. Both sit outside the phone frame.

**Why.** ADR-008 already said the actor switcher is not optional — a poster-side
offer inbox cannot be reviewed without flipping identity. The clock is the same
argument applied to time. The 72-hour confirm window, quest expiry and the
auto-release that stops a doer being stranded by an unresponsive poster are
three of the product's load-bearing promises, and none of them can be looked at
in a session that lasts ten minutes. A state you cannot reach is a state nobody
reviews, which is exactly how the prototype ended up with one empty state across
five screens.

**Consequence.** Time is a value in the store, never `Date.now()`. Every
duration, countdown and "Today, 6pm" is computed against it. That is a
constraint on all future feature code, and a good one: it makes time testable.
The system transitions (expire, auto-release) live in one pure function that
runs whenever the clock moves, so they behave identically whether a person
advanced the clock or three days actually passed.

**Cost.** Two controls to strip — or rather, to gate — before a public build,
and a discipline that is easy to break with one careless `new Date()`.

---

## ADR-010 · Ink on flare, not paper

**Decision.** The three places the design system put `--paper-000` text on
`--flare-500` — the Badge "hot" tone, the `IconButton` counter and the `TabBar`
counter — now use `--ink-900`.

**Why.** PRD §10 already flagged paper-on-flare as failing WCAG AA at body size
and restricted it to headline scale. All three of these were small bold text at
10–12px, which is well under body size. Measured, paper on flare is **3.11:1**;
AA wants 4.5:1 for text this size. Ink on flare is **5.90:1**.

It also makes the system more consistent rather than less: `--lime-500` and
`--coin-500`, the other two bright fills, already carry ink text. Paper on flare
was the odd one out.

**Where this has to go.** The change was made in the published `ds-bundle.js`,
which is a generated export. It needs carrying back into `project/_ds_bundle.js`
or it will be lost on the next regeneration.

**Enforcement.** `test/rules.js` now fails if paper-on-flare reappears at body
scale, along with the rest of the content rules, so this cannot silently
regress.
