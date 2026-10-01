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

---

## ADR-011 · One price per quest, no hourly rate

**Decision.** Every quest is a single agreed amount. Hourly pricing is removed
from the product: no fixed-versus-hourly switch, no rate, no total derived from
the duration. The field is labelled "Price" — not "Fixed price", because there
is nothing to distinguish it from.

**Why.** Hourly made the poster commit to a number they could not actually
predict, and it made the escrow hold a guess. Everything downstream depended on
that guess: the amount held on acceptance, the fee, the payout, what the doer
saw on the card. Two people agreeing one number up front is the thing the
escrow model is built for, and it is what makes "the money is held, always"
mean something specific. It also removes the only place in the app where the
price shown and the price charged could differ.

**What survives.** The duration estimate stays, with a wider set of options
including the open-ended ones (6+ hr, 12+ hr, All day). It tells a doer what
they are taking on; it no longer multiplies anything. That separation is the
point: information for the doer, not an input to the money.

**Cost.** Long or unpredictable jobs are harder to price, and a poster who
guesses low has no mechanism to top up mid-quest. If that turns out to bite,
the answer is a "revise the price" transition both sides accept — a lifecycle
change, not a return to rate-based billing.

**Consequences.** `payout_unit` is kept in the data model and written as
`fixed`, so reintroducing a second mode would not need a migration. The one
hourly fixture (a 3-hour wardrobe assembly at NT$350/hr) became one agreed
NT$1,050, and the two offers on it moved with it. PRD §5's pricing anchors and
§7.4's budget rule are amended to match.

---

## ADR-012 · The preview starts signed in; onboarding is real but not the default gate

**Decision.** M1 built the sign-in and first-run flow PRD §7.1 requires — a
welcome screen pitching both sides in one look, a location-permission ask with
a reason (not a bare OS prompt) that degrades gracefully on "Not now", and
mocked Google / 6-digit-OTP sign-in with both of its failure paths: an invalid
contact, and the mock's one deliberately-wrong code, `000000`. But
`Prototype()` still boots with the viewer already signed in — it does not gate
on this flow by default. "Sign out", now in Settings, is how it is reached.

**Why.** ADR-008 already settled the actor switcher's job: two-sided software
can't be reviewed from one chair, so a reviewer becomes any of six people in
one tap. Every existing suite — `screens.js`, `lifecycle.js`, `ledger.js`,
`rules.js` — depends on that: they boot straight into the tab shell and drive
the M2–M6 lifecycle from there. Gating the whole prototype behind five
onboarding taps on every load would fight that principle for no product
benefit — onboarding needs to be built and reviewable, not mandatory friction
between a reviewer and the feature they came to look at.

**Cost.** The literal sentence in `HANDOFF.md` — "the preview starts signed
in" — stays true a little longer than the milestone label suggests. Nobody
trips over onboarding by accident; they have to know "Sign out" is where it
lives.

**Where this is reachable.** Settings → Sign out, from any actor. Every
screen and both failure paths are also in the States gallery, per ADR-008's
"every milestone has to be reviewable in isolation" — so the flow is visible
even to someone who never clicks through it live.

**Revisit if.** M0's real Expo scaffold begins. A freshly-installed app has no
prior session to default into, so the real product — unlike this preview —
should gate on auth from a cold start. That is a different codebase and a
different default, not a reason to change this one.

---

## ADR-013 · Pending payments scoped to deposit/cash-out; the memory adapter's clock is seed-anchored

**Decision (pending scope).** ADR-005's "every payment passes through
`pending` even in the mock" applies to `deposit`/`cashOut` only. Accepting an
offer (hold), confirming a quest (release), and cancelling (refund) are
ledger-internal `user_available`↔`user_held` moves that settle atomically
with the lifecycle transition causing them — no `Payment` record, no
`pending` state, exactly like `balanceOf` never exposing a stored field.
`docs/HANDOFF.md`'s broader claim that pending applies to all five
transactions is superseded by this ADR.

**Why.** `pending` exists to model a real payment provider sitting behind
`deposit`/`cashOut` — they're the only two transactions that cross the
`external_bank` boundary (PRD §9's `payments` table is keyed on
`provider`/`provider_id`, a shape only those two ever populate). Hold,
release, and refund never leave the ledger: there's no provider on the other
side of an escrow hold to model a webhook for. Modeling `pending` there too
would invent latency and a settlement race with nothing real behind it —
the same "don't build infrastructure for a caller that doesn't exist" reasoning
this codebase has applied since M1.

**Mechanism.** `deposit`/`cashOut` return a `Payment` in state `pending`
immediately; `payment-settlement.ts` settles it on a jittered 800–1600ms
timer (`scheduleSettlement`) — writing the real ledger entries and flipping
the state to `succeeded`, or, on a simulated fault, `failed` with nothing
written. `LedgerPort` stays deliberately narrow (`listEntriesForUser`,
`balanceOf`, `listPaymentsForUser`, `deposit`, `cashOut`) — no general "post a
transaction" method, so hold/release/refund can only ever happen as a side
effect of a real `QuestsPort`/`OffersPort` transition, never called directly.

**Decision (clock).** The memory adapter's clock is a value in the store,
anchored to `seed.now` at boot, moved only through an explicit
`advanceClock(deltaMs)` — never `Date.now()`. `src/data/domain/clock.ts`'s
`planSweep(quests, offers, nowMs)` is ADR-009's "one pure function that runs
whenever the clock moves," applied for real: every mutation-path timestamp
(`quests.ts`, `offers.ts`, `threads.ts`, `notifications.ts`) now reads
`nowIso()`/`nowMs()` from this clock, and real screens read time only through
`useNow()` (a `useSyncExternalStore` subscription) — never `advanceClock`,
which stays dev-only plumbing re-exported through `composition-root.tsx` the
same way the fault-injection switch already was.

**Why (clock).** `seed.ts`'s `now` is `2026-09-16T09:00:00+08:00` —
consistently behind the real device clock by construction, since the fixture
is a snapshot, not a moving target. A sweep run against `Date.now()` would
silently expire most of the open feed and auto-pay every completed quest the
instant it first ran, destroying the fixture on load. Anchoring to the seed
makes every previously-checked-in adapter test's exact deltas (an offer
closes in *n* hours, a confirm window has *m* hours left) durable regardless
of which real calendar day the suite happens to run on.

**Cost.** `useNow()`/`advanceClock` are memory-adapter-specific — M7's
Supabase swap must source time from the server or device instead, not carry
this forward. The DevStrip's clock buttons are `__DEV__`-gated, same as the
actor switcher (ADR-008); a production `expo export -p web` build never
shows them, so the clock only moves by a real timer's own tick, exactly like
production would.

---

## ADR-014 · Trust fields stay seed-authored, not recomputed; report/block scoped to users only

**Decision (rating/quests/cancel-rate).** `User.rating`, `questsCompleted`,
and `cancelRate` stay exactly what `seed.ts` authored them as. M6's real
`submitReview` never recomputes them from the review corpus it writes to,
even though PRD line 176 calls them "(derived)" on the intended production
schema.

**Why.** The fixture's own numbers make deriving them dishonest at this
milestone's scale: `u0`'s `rating` is `4.8` across `27` `questsCompleted`,
and the whole fixture carries exactly one seeded `Review` record (`r1`).
Recomputing `rating` as an average over what `submitReview` can actually
produce today would replace a real, PRD-plausible number with a misleading
one — `27` completed quests' worth of reputation collapsing to whatever the
one or two reviews a demo session manages to create. The seed's numbers
represent history this milestone has no way to reconstruct; keeping them
static is honest about that, the same call M5 made *not* to synthesize a
deeper ledger history than the fixture actually has. A real backend (M7+),
with a real review corpus accumulated over real time, is where "(derived)"
becomes true rather than aspirational.

**Cost.** Submitting reviews in this build never moves the trust numbers a
viewer sees elsewhere on the app — `RatingStar`, `UserChip`'s inline rating,
and `PublicProfileScreen`'s badge row all keep showing the seed-authored
figure regardless of what gets rated in a session. `docs/ROADMAP.md` and any
later milestone should treat wiring real aggregation as new work, not a gap
this milestone left half-finished.

**Decision (report/block scope).** PRD §7.8 says "Report and block on any
user or quest." The real, buildable slice is user-level only: `TrustPort`
has `reportUser`/`blockUser`/`listBlockedUserIds`, no quest-level report, and
no `unblockUser`.

**Why.** `preview/app.js`'s own `PublicProfileScreen` is the *only* place
either action exists anywhere in the source, and it only ever targets a
user — no quest ever gets a report or block trigger anywhere in the
prototype, despite the PRD line's broader wording. Building a quest-level
report path would be inventing a surface the reference product never had,
not porting one. `unblockUser` is left off the port for the same
"don't build infrastructure for a caller that doesn't exist" reasoning
ADR-013 already used for a general `postTxn`: no screen anywhere surfaces a
"blocked users" list to unblock from, so the method would have no real
caller. A future milestone adding that list is the natural place to add the
method alongside it, not before.

**Mechanism.** `blockUser` writes a real per-viewer `Set<blockedUserId>`
(`blockedUserIds` in `store.ts`); `listQuests` gained a `viewerId` param that
filters out any quest posted by someone the viewer has blocked — real
discovery-time filtering, not a cosmetic hide. `reportUser` creates a real,
persisted `Report` record that nothing in the product reads back — the same
accepted shape a disputed quest's unreachable admin-resolution half already
has in this codebase: a frozen record with no resolution UI is a known,
intentional end state here, not an oversight.

---

## ADR-015 · M7 is a real Supabase scaffold, never run against a live project

**Decision.** M7 ("Supabase") was built end to end — schema, RLS, every RPC,
the full `adapters/supabase` implementation, realtime, real Google OAuth +
OTP — as a **scaffold only**, per explicit direction: no live Supabase
project exists, and nothing under `supabase/migrations/*.sql` or
`src/data/adapters/supabase/*.ts` has ever been run against a real Postgres
instance. Every file's own header comment says so. This ADR is the one place
that scope, and the real architecture decisions made while building under
it, are recorded together.

**Why a scaffold, not a wait.** The alternative — waiting for a live project
before writing any of this — would have left M7 entirely undemonstrated
until someone provisions one. Building the real thing now, honestly labeled
as unverified, means the moment a project exists, turning the scaffold on is
config and one seed-script run (`npm run db:seed`), not a second M7. The
cost is real and stated plainly rather than glossed over: **verification
here is structural, not integration.** Every `adapters/supabase/*.ts` file
has a matching `*.test.ts` that mocks `@supabase/supabase-js`'s client
(`src/data/adapters/supabase/test-support/fake-client.ts`) and asserts which
table/column/RPC-name/args an adapter method actually sends — real signal
that the code is shaped correctly, never proof that a query executes, that
an RLS policy actually blocks what it's supposed to, or that a migration
even applies cleanly. `docs/ROADMAP.md`'s M7 checklist is marked accordingly:
items this scaffold satisfies for real are checked; the ones that
categorically need a live project to satisfy are left open, with why.

**Real architecture decisions this milestone made, not left for later:**

- **Flat-grid geo → real PostGIS.** `geo.ts`'s own header comment named this
  M7 work from M0. `quests.location` is a generated `geography(Point,4326)`
  column, derived from the existing `point_x`/`point_y` via
  `taipei_grid_to_geog()` — a plain equirectangular projection anchored at
  Taipei Main Station's real coordinates. `listQuests`' radius/sort logic
  moved into a `list_quests()` SQL function (`ST_DWithin`/`ST_Distance`),
  since PostGIS operators aren't expressible through postgrest's query
  builder. `todayOnly` compares against the real server clock, not a
  seed-anchored one — ADR-013 already flagged that the memory adapter's
  clock is adapter-specific and wouldn't carry forward.
- **`quests.address_line` is hidden by revoking column privilege, not by
  RLS.** RLS filters rows, not columns, and `quests`' own visibility is
  otherwise unconditional (any authenticated user can see any quest by id,
  matching `getQuest`'s real unconditional lookup today). `address_line` is
  excluded from the column grant entirely and exposed only through
  `quest_address_line()`, a `SECURITY DEFINER` function porting
  `addressVisibleTo()` server-side, surfaced through a `quests_with_address`
  view every read goes through. Realtime's `postgres_changes` payload gets
  no such guarantee — its WAL-based decoding happens below the SQL privilege
  layer — so `subscribeToQuest` deliberately never trusts its own pushed
  row for `address_line`, refetching through the same safe view on every
  change instead.
- **Guarded mutations are RPCs; guard-free ones are plain RLS-protected
  writes.** Every mutation with real cross-row logic (accept an offer,
  confirm done, submit a review, cancel with a refund, ...) is a
  `SECURITY DEFINER` function porting the memory adapter's exact guard
  order — never a direct client table write. The handful with no guard
  beyond "your own row" (saved quests, blocking, marking a thread read,
  updating your own editable profile fields) get a plain RLS policy
  instead, deliberately, once per table (recorded at each one's own
  migration).
- **Idempotency ports `isFirstUse(method, key)` as-is, backed by a real
  constraint instead of an in-process `Map`.** `idempotency_keys(method,
  key)` plus `idempotency_claim`/`store_result`/`result` are the direct
  translation; `common.ts`'s own comment ("Supabase's will likely use a
  unique constraint instead") anticipated this. Mutations that create a row
  with no natural post-hoc lookup (`post_quest`, `send_message`, `deposit`,
  `cash_out`, `report_user`) use the dedicated jsonb result cache; every
  other mutating RPC calls `idempotency_claim` alone and re-derives its
  replay value from the row's current state, matching the memory adapter's
  own split exactly.
- **Every RPC checks the caller actually owns the role they're acting
  as — a real tightening the memory adapter's single-process trust model
  never needed.** `ports/offers.ts`'s own header comment notes
  `withdrawOffer`/`declineOffer`/`acceptOffer` take no `actorId` in the real
  port; a single mock user has no one else who could call them with a
  forged id, but a real multi-tenant database does. Every lifecycle/offer
  RPC verifies ownership via `auth.uid()` before doing anything, the same
  posture as the address-hiding fix above.
- **Payment settlement is client-driven, not server-scheduled, and that is
  named as a real trust-boundary simplification, not glossed over.** There
  is no live project to attach a webhook or `pg_cron` job to. `deposit`/
  `cash_out` return a `pending` `Payment`; the client schedules a jittered
  delay (mirroring the memory adapter's own `payment-settlement.ts`) and
  then calls `settle_payment()`, which re-validates ownership, pending
  state, and — for a cash-out — the balance again before writing a single
  ledger entry. A client that never calls it just leaves a payment pending
  forever; it can never corrupt the ledger. A real deployment replaces the
  client-side timer with a server-side one and nothing else changes.
- **The 72-hour auto-release `system` actor (`completed -> paid`) is not
  reachable here.** The memory adapter's clock-sweep (`advance-clock.ts`)
  performs it against a seed-anchored clock that is itself explicitly
  memory-adapter-only (ADR-013). A real auto-release needs a real
  scheduler with nothing to attach it to yet — `confirm_done` is reachable
  by the poster only, and this gap is named here rather than silently
  dropped.
- **Storage for quest photos and avatars was not built.** No `photos` field
  exists anywhere in the real `Quest` contract, and no photo-picker UI
  exists anywhere in the app — M3's own scope notes deferred it and no
  later milestone revisited it. Building Supabase Storage buckets and RLS
  for a feature with zero real callers would be exactly the "infrastructure
  nothing calls" this codebase has consistently avoided since M1
  (`ADR-014`'s `unblockUser`, `ports/ledger.ts`'s missing general
  `postTransaction`, ...). Left unchecked on the M7 checklist, honestly,
  rather than built and orphaned.
- **`supabase gen types` was never run — there's nothing to generate types
  from.** `database.types.ts` is hand-authored and deliberately *not* wired
  into `createClient<Database>()`'s schema generic: postgrest-js's
  select-string parser needs full `Relationships`/`Functions` metadata a
  hand-maintained file would have to fake, for a schema no live instance has
  ever validated it against. Each `adapters/supabase/*.ts` file defines its
  own narrow `*Row` interface and casts its query results instead — the
  same "trust the shape, verify it once there's a real project" posture the
  rest of this scaffold takes.

**Cost / what turning this on actually requires**, recorded once here
rather than scattered: provision a Supabase project; run
`supabase db push` (or apply `supabase/migrations/*.sql` in order); enable
Google as an auth provider with a matching Google Cloud Console OAuth
client, and (if phone OTP matters at launch) a configured SMS provider; run
`npm run db:seed` against it with a service-role key; set
`EXPO_PUBLIC_DATA_ADAPTER=supabase` plus the two `EXPO_PUBLIC_SUPABASE_*`
vars (`.env.example`). Nothing in feature code changes — that is ADR-004's
whole promise, and this milestone is the first real test of whether it held.

## ADR-016 · M8's code-only slice, and why Sign in with Apple went native

**Decision.** M8 ("Public app + web app") is categorically different from
M0-M7: most of its checklist is store accounts, money, domains, and legal
review — not code. Per explicit direction, M8 built only the slice that is
genuinely code and needs no real account, payment, or legal decision:
offline queueing with retry and persistence, an error boundary around the
app shell, EAS build profiles with icon/splash wiring, and Sign in with
Apple. Store submission, a purchased domain, an analytics/crash-reporting
service choice, and the legal/escrow review (PRD §14.2) are explicitly
**not** built here — each needs a decision or an account only the product's
owner can make, and `docs/ROADMAP.md`'s M8 checklist leaves them open with
why, the same honesty ADR-015 applied to M7's "never run against a live
project" scope.

**Offline queueing is TanStack Query's own mechanism, not a bespoke
queue.** `src/data/query-client.ts`'s `createAppQueryClient()` sets
`networkMode: "offlineFirst"` on both queries and mutations and wires
`onlineManager` to `@react-native-community/netinfo` (React Native has no
`navigator.onLine` for react-query's web-default listener to use) — a
mutation fired while offline parks in `pending` state and resumes
automatically the moment `onlineManager` reports back online, with no
queue data structure of our own to get wrong. `persistAppQueryClient()`
layers `@tanstack/react-query-persist-client` + an AsyncStorage persister
on top for cold-start recovery, with one deliberate exclusion: any query
whose key starts with `"ledger"` is never persisted, since AsyncStorage is
unencrypted and wallet balances/entries/payments are the one class of data
in this app actually worth protecting from a stolen, unlocked device.

**The error boundary is the app's first, placed once, at the root.**
`src/design/components/ErrorBoundary.tsx` wraps `<Slot/>` in
`app/_layout.tsx` — a single boundary at the shell, not one per screen,
because nothing in this codebase has needed finer-grained recovery and a
screen-level crash with no boundary above it would otherwise white-screen
the whole app. It reuses `Screen`/`ErrorState` for its fallback, matching
every other error surface in the product instead of inventing a second
one.

**EAS profiles are real config; the project identity inside them is not
invented.** `eas.json`'s development/preview/production profiles and
`app.json`'s `ios.bundleIdentifier`/`android.package`
(`com.youdo.app`) are honest placeholders — a real app needs *some*
identifier, and this one is clearly a placeholder, not a deployed
product's real id. What is deliberately **not** fabricated: `extra.eas.
projectId` and `updates.url` only exist after a real `eas init` against a
real EAS account, and inventing plausible-looking values for either would
be actively misleading rather than honestly incomplete — the same
distinction ADR-015 drew between a real scaffold and a live integration.

**Sign in with Apple went native on iOS, not a third call to the shared
browser-OAuth helper — because Apple requires it, not by preference.**
ADR-007 already named this as a forward-looking consequence: "Sign in
with Apple becomes mandatory for App Store review once any third-party
social login ships. Budgeted into M8 as a blocker, not an enhancement."
Apple's own App Store Review Guideline 4.8 requires the native, officially
branded button wherever a third-party social sign-in is offered on iOS —
this is that guideline executed, not a new independent design choice.
`src/data/adapters/supabase/auth.ts`'s `signInWithApple` branches on
`Platform.OS`: off iOS it falls through to the same `browserOAuthSignIn`
helper Google already uses (now parameterized by provider instead of
hardcoded to Google); on iOS it calls `expo-apple-authentication`'s native
`signInAsync` directly, rendering Apple's own `AppleAuthenticationButton`
in `SignInScreen.tsx` rather than a custom-styled `Button` matching the
screen's other two. The native flow's nonce handshake follows Apple and
Supabase's documented pairing exactly: a raw nonce (`expo-crypto`'s
`randomUUID()`) is sent to Supabase's `signInWithIdToken`, while its
SHA256 hash is sent to Apple's `signInAsync` — the two systems compare
against each other to prevent token replay, so the two values sent must
never be the same one.
