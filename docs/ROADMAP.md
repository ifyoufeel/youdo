# YouDO — Build Roadmap

Nine milestones. Each is a **vertical slice** that ends in something you can click through on a real phone — not a layer that only makes sense once the next one lands.

**Per-milestone ritual**
1. Branch `m{n}-{slug}` off `main`.
2. Build to the checklist.
3. Ship both previews: EAS Update preview channel (device) + Vercel static export (link).
4. Open a PR with both links and the exit-criteria checklist.
5. **Ask before merging.** Nothing merges unattended.

**Two tracks:** M0–M7 are *Pre-Finals* — clickable demos of increasing completeness. M8 is *Final* — public release of app and web.

---

## M0 · Foundation & preview rail

**Goal:** no features. Prove the design system survives the port, and make every later milestone previewable by default.

**Why first:** the two genuinely risky unknowns — the sticker shadow on Android, and the variable font on Android — are cheap to fix now and ruinous to discover at M4.

- [ ] Commit the outstanding design-system QA work (34 files) so the baseline is clean
- [ ] Expo scaffold: Expo Router, TypeScript strict, New Architecture, path aliases
- [ ] `scripts/gen-tokens.ts` — parse `project/tokens/*.css` → `src/design/tokens/{raw,semantic,type}.ts`; px→number, em→points, unitless line-height→computed
- [ ] Fonts: bundle **static instances per weight** (not the variable font) via `expo-font`; verify `tabular-nums` engages on Android
- [ ] `<Sticker>` — hard offset shadow via duplicated offset View; spike on a low-end Android device
- [ ] `Icon` → `react-native-svg`, all 47 glyphs; resolve `currentColor` (no RN equivalent) to a token default
- [ ] `Screen` shell — SafeArea + TopBar + scroll body + sticky bottom slab
- [ ] Data layer: `contracts` (types + zod), `ports`, `adapters/memory`, composition root, `RepositoryProvider`
- [ ] **Renormalise the seed data**: Taipei locations, realistic NT$ amounts, ISO timestamps, metres, status enums, geo points, real entity IDs, Taiwan-appropriate names
- [ ] `app/(preview)/` gallery — components, screens, tokens, flows; actor switcher; fault injection
- [ ] CI: token drift check, typecheck, lint rule forbidding `src/design`|`src/data` → `src/features` imports
- [ ] Vercel project + EAS preview channel wired

**Exit:** the token specimen and component gallery render correctly on iOS, Android and web, and visually match the existing `project/**/*.card.html` reference renders.

**Preview:** component gallery — every component, every state.

---

## M1 · Onboarding + Explore

**Goal:** a new user can sign in, grant location, and browse real (mock) quests near them.

- [ ] Auth screens behind `AuthPort` (mocked): Google button + 6-digit OTP entry for email/phone
- [ ] First-run explainer (both sides of the market) + justified location permission request; graceful degradation if denied
- [ ] i18n layer wired — **no hardcoded user-facing strings from here on**
- [ ] Tab shell with the five tabs
- [ ] Browse feed on FlashList, cursor pagination, pull-to-refresh
- [ ] Search (title + description substring)
- [ ] **Working filter sheet** — radius, minimum pay, time window, verified-only; persists; composes with search
- [ ] **Working sort control** — closest, best paid, ending soonest, newest
- [ ] Save / unsave with optimistic update
- [ ] Empty, loading and error states (loading is a sunken card with text — the system bans shimmer)

**Exit:** filters and sort demonstrably change the result set; every list state is reachable from the preview gallery.

**Preview:** sign-in → browse → filter → save.

---

## M2 · Quest detail + offers

**Goal:** a doer can make a real offer that the poster will actually receive.

- [ ] Detail screen: payout, meta rows, description, requirements, poster trust panel, offer count
- [ ] **Address privacy** — coarse distance only; exact address gated behind acceptance
- [ ] Offer sheet: accept asking price **or propose your own**, plus a note — both **persisted**
- [ ] Creates a real `offer` record and a real thread bound to (quest, doer)
- [ ] One active offer per quest per doer; withdraw while pending; posters blocked from offering on their own quests
- [ ] Confirmation toast carries the real poster's name

**Exit:** two different offers on two different quests produce two distinct threads carrying the right amounts.

**Preview:** browse → detail → offer → confirmation, with the actor switcher showing the poster's side.

---

## M3 · Post a quest

**Goal:** a posted quest really exists and is discoverable.

- [ ] Multi-step wizard: what → details/photos → where → when → budget → review
- [ ] Validation that **blocks** submit, with errors written as fixes
- [ ] Draft autosave surviving app restart
- [ ] Photo picker (`expo-image-picker`), date/time picker, currency input, address entry
- [ ] Fixed vs hourly budget; hourly shows estimated total
- [ ] Fee disclosure before submission
- [ ] Posted quest appears in the feed and My quests immediately
- [ ] **Supabase spike (throwaway):** prove the PostGIS radius query and the chat RLS policy now, not at M7

**Exit:** post a quest, find it in the feed by search and by filter, open it as the other actor.

**Preview:** full posting flow ending in a discoverable quest.

---

## M4 · Chats, offers & lifecycle

**Goal:** the marketplace actually closes the loop. Both sides, end to end.

- [ ] **Per-thread messages** — fixes the prototype's shared-global-thread bug
- [ ] Composer with keyboard handling; unread counts cleared on open
- [ ] **Poster-side offer inbox** — accept / decline, which does not exist today
- [ ] Accepting one offer auto-declines the others and reveals the address
- [ ] The state machine from PRD §8, with actor guards enforced in the repository layer
- [ ] "Mark as done" works; 72h confirm window with auto-release
- [ ] Cancel with reason, from both sides
- [ ] `StatusTrack` driven by real quest status

**Exit:** post as actor A, offer as B, accept, start, complete, confirm — the status agrees on both sides at every step. Illegal transitions are rejected.

**Preview:** scripted two-sided walkthrough in the flows gallery.

---

## M5 · Wallet & simulated escrow

**Goal:** money is real arithmetic, even though no real money moves.

- [ ] `Money` type + `formatMoney` boundary; lint-ban `Intl.NumberFormat` elsewhere
- [ ] Append-only ledger across the five named accounts
- [ ] Hold on acceptance · release on confirm minus fee · refund on cancel · payout on cash-out
- [ ] Balances derived by summation — never stored
- [ ] Wallet: available, held, full ledger with real running effects
- [ ] Cash-out flow; payment methods screen (simulated) behind `PaymentsPort`
- [ ] Every payment passes through `pending`, mirroring Stripe's webhook-driven reality
- [ ] Tests: entries sum to zero per transaction; each lifecycle transition emits the expected entries

**Exit:** complete a quest and watch the exact amount move poster → held → doer, fee deducted, balances reconciling.

**Preview:** wallet before/after a completed quest.

---

## M6 · Profile, trust & notifications

**Goal:** close every unreachable-screen gap the prototype left.

- [ ] Profile: own and public; ratings, quests completed, verification, cancellation rate
- [ ] **Ratings capture** after `paid` — today the system only displays them
- [ ] Saved-quests list (saves are tracked today but never listed)
- [ ] Notification inbox + push registration; per-category toggles
- [ ] Report / block on users and quests
- [ ] Settings, including account deletion
- [ ] Decision point: does Chinese localisation block launch?

**Exit:** no dead ends — every screen in the app is reachable from navigation.

**Preview:** full app, all tabs, nothing stubbed.

---

## M7 · Supabase

**Goal:** swap the data layer. Feature code must not change.

> **Five subsystems, not one:** auth, RLS, storage, realtime, PostGIS. The M3 spike de-risks the two hardest.

- [ ] Schema + migrations matching `ports`
- [ ] RLS per table — especially `quests.address_line` (hidden until assigned) and thread membership
- [ ] Real auth: Google OAuth + email/phone OTP; `expo-secure-store` session adapter
- [ ] `adapters/supabase` implementing every port
- [ ] Realtime for messages and offer events, landing via `setQueryData`
- [ ] Storage for quest photos and avatars
- [ ] PostGIS radius search behind the geo params the ports have carried since M0
- [ ] Seed script using the **same fixtures** so previews stay identical
- [ ] Run the existing test suite green against both adapters

**Exit:** flipping one env flag switches adapters with no feature-code diff; data persists across devices and reinstalls.

**Preview:** the same app, real accounts, two physical devices talking to each other.

---

## M8 · Public app + web app *(Final)*

**Goal:** publicly available on both stores and the web.

- [ ] **Sign in with Apple** — mandatory for App Store review once Google sign-in ships
- [ ] Offline queueing, retry, error boundaries
- [ ] Analytics + crash reporting
- [ ] EAS build profiles; app icons, splash, adaptive icons
- [ ] Store listings, screenshots, privacy nutrition labels, age rating, support URL
- [ ] Account deletion flow exposed as Apple requires
- [ ] Web app promoted from preview surface to production deployment with its own domain
- [ ] Legal: terms, privacy policy, and the escrow regulatory review (PRD §14.2) **resolved before real money is enabled**

**Exit:** installable from both stores; the web app serves the same product at a public URL.

---

## Dependency notes

- M0 gates everything.
- M2 depends on M1's feed; M4 depends on M2's offers and M3's quests.
- M5 can be built in parallel with M4 but cannot be *demonstrated* until M4's acceptance transition exists.
- M7 depends on the ports being honest since M0 — async, cursor-paginated, geo-aware, subscription-shaped.
- M8's legal review has external lead time. Start it during M5.
