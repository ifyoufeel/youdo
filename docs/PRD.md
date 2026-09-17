# YouDO — Product Requirements

**Status:** draft v1 · **Market:** Taiwan (Taipei first) · **Currency:** TWD (NT$) · **Language:** English at launch

---

## 1. Summary

YouDO is a peer-to-peer **quest marketplace**. Neighbours post small paid jobs — a dog walk, a parcel run, a flat-pack wardrobe — and other people nearby take them on to earn money. Both sides are ordinary people, not businesses.

The product has to do two things at once:

1. **Make earning feel light and immediate.** Someone with a free hour should find a nearby job, take it, and get paid without paperwork.
2. **Make trusting a stranger feel safe.** Two people who have never met are exchanging money, an address, and often house access.

Every product decision below serves one of those two goals. Where they conflict, safety wins.

---

## 2. The problem

**For the poster:** small tasks fall through the cracks. Too small for a professional service, too awkward to ask a friend, too urgent to postpone. Existing options are either expensive marketplaces built for tradespeople or informal community groups with no payment protection and no accountability.

**For the doer:** casual earning is hard to access. Gig platforms demand vehicles, licences, long onboarding, or fixed shifts. There's no low-commitment way to convert a spare hour into cash.

**The market failure in the middle:** neither side will transact without trust, and trust cannot be established between strangers without a third party holding the money and the reputation. That third party is the product.

---

## 3. Users and roles

One account, two roles. The same person posts a quest on Tuesday and completes one on Saturday — the design already assumes this (the tab bar carries both "My quests" and browse).

| | **Poster** | **Doer** |
|---|---|---|
| Wants | The thing done, with minimal coordination | Money, quickly, on their own schedule |
| Fears | Nobody shows up; a stranger in their home; overpaying | Not getting paid; wasted travel; unclear scope |
| Needs from us | Verified people, held payment, clear cancellation | Honest distance and pay, payment guaranteed before starting |

**Not users at launch:** businesses, agencies, professional tradespeople. If someone needs a licensed electrician, YouDO is the wrong product and should not pretend otherwise.

---

## 4. Principles

1. **The money is held, always.** No quest begins without funds already in escrow. This is the core trust mechanic and it is never optional.
2. **Distance and pay are never rounded in our favour.** If it's 3.1 km, we say 3.1 km.
3. **The exact address is private until acceptance.** The design already states this; it is a requirement, not a nicety, and is enforced server-side.
4. **Cancellation is a normal event, not a failure.** It has a clear path, a clear refund, and a visible record.
5. **No dark patterns around money.** Fees are shown before commitment, not after.

---

## 5. Market and locale

Launching in **Taipei**, expanding to other Taiwanese cities.

- **Currency: TWD.** Stored as integer minor units; displayed as whole dollars (`NT$400`, not `NT$400.00`) because TWD is transacted in whole dollars despite a nominal two-decimal exponent.
- **Realistic pricing anchors:** parcel run NT$200 · dog walk NT$400 · printer setup NT$400 · sofa carry NT$600 · furniture assembly NT$350/hr. Seed fixtures must use these ranges.
- **Language: English at launch**, with all user-facing strings behind an i18n layer from M1 so Traditional Chinese is a translation pass rather than a refactor.
- **Distance in metric**, coarse units (`1.2 km`, `600 m`).
- **Phone numbers:** +886 format.

> **Known risk.** An English-only consumer marketplace in Taiwan limits reach on both sides. The i18n seam exists specifically so this can be corrected without re-engineering. See ROADMAP M6/M8.

---

## 6. Scope

**In scope for v1 (M0–M7):** account creation, location-based discovery, search/filter/sort, saving quests, quest detail, offers with custom pricing, posting with photos and scheduling, per-thread messaging, the full quest lifecycle, simulated escrow and wallet, ratings, verification badges, notifications, profile.

**In scope for launch (M8):** public iOS + Android release, public web app, account deletion, privacy disclosures.

**Explicitly out of scope:**
- Real money movement (simulated ledger only — see §11 and the regulatory flag in §14)
- In-app identity verification against government ID (badge is manual//stubbed at launch)
- Background checks, insurance, disputes arbitration at scale
- Business accounts, teams, recurring quests, subscriptions
- Native maps browsing (list-first; map view is post-launch)
- Chinese localisation (seams present, translation deferred)

---

## 7. Functional requirements

### 7.1 Accounts and onboarding
- Sign in with **Google** or a **6-digit OTP** sent to email or phone. No passwords.
- First run explains the two sides in one screen and asks for location permission with a reason, not a bare OS prompt.
- A profile requires a display name and photo before a user may post or offer.
- Users may delete their account; deletion anonymises historical quests rather than destroying counterparty records.

### 7.2 Discovery
- Feed of open quests ordered by distance from the user by default.
- **Search** filters by title and description substring.
- **Filters:** distance radius, minimum pay, time window, verified posters only. Filters persist across sessions and compose with search.
- **Sort:** closest, best paid, ending soonest, newest.
- Quests may be saved; saved quests are listed on the profile.
- Empty state names the next action ("Nothing near you right now — widen the radius to 5 km?"), never just reports emptiness.
- Paginated (cursor-based), with pull-to-refresh.

### 7.3 Quest detail and offers
- Shows title, payout, category, coarse distance, duration estimate, schedule, description, requirements, poster trust panel, and the count of existing offers.
- **Exact address is hidden** until an offer is accepted.
- A doer may accept the asking price or **propose a different one**, with an optional note. Both are persisted and shown to the poster.
- A doer may send at most one active offer per quest, and may withdraw it while pending.
- Posters cannot offer on their own quests.

### 7.4 Posting
- Multi-step: what → details and photos → where → when → budget → review.
- Validation **blocks** submission: title ≥ 8 characters, category, location, budget > 0, schedule present.
- Drafts autosave and survive app restart.
- Budget is fixed or hourly; hourly shows an estimated total from the duration.
- Fee disclosure appears before submission.
- The posted quest appears immediately in discovery and in My quests.

### 7.5 Messaging
- One thread per (quest, doer) pair, created when an offer is sent.
- Per-thread message history — never shared or global.
- Unread counts per thread, cleared on open. Realtime delivery from M7.
- Threads are read-only once a quest reaches `paid` or `cancelled`, but remain visible.

### 7.6 Lifecycle
See the state machine in §8. Requirements:
- Every transition is triggered by a specific actor and validated server-side.
- Both parties see the same status at all times.
- The confirm window after completion is **72 hours**, after which payment auto-releases so doers are never stranded by an unresponsive poster.

### 7.7 Money and escrow
- Funds are held when the poster **accepts an offer** — not at posting.
- Held funds are released to the doer when the quest is confirmed complete, minus the platform fee.
- Cancellation before completion refunds the poster in full.
- The wallet shows available balance, held balance, and a full ledger with running effects.
- Cash-out moves available balance to an external account (simulated at launch).

### 7.8 Trust and safety
- Verification badge on profiles (manually granted at launch).
- Mutual ratings (1–5 plus optional comment) unlocked only after `paid`, visible after both submit or after 14 days.
- Report and block on any user or quest.
- Cancellation rate is recorded and visible on profiles.
- No phone numbers or addresses in free-text fields are surfaced before acceptance.

### 7.9 Notifications
- Push and in-app inbox for: new offer received, offer accepted/declined, message received, quest starting soon, quest marked done, payment released, confirm window closing.
- Per-category toggles in settings. Transactional payment notifications cannot be disabled.

---

## 8. Quest lifecycle state machine

States: `draft` · `open` · `assigned` · `in_progress` · `completed` · `paid` · `cancelled` · `expired` · `disputed`

| From | To | Actor | Guard | Side effects |
|---|---|---|---|---|
| — | `draft` | Poster | — | Saved locally, not discoverable |
| `draft` | `open` | Poster | Required fields valid; payment method on file | Indexed for discovery; `expires_at` set |
| `open` | `assigned` | Poster | Accepts an offer; sufficient available balance | **Escrow hold created**; other offers auto-declined; exact address revealed to doer |
| `assigned` | `in_progress` | Doer | At or after scheduled time | Poster notified |
| `in_progress` | `completed` | Doer | — | Poster notified; 72h confirm window opens |
| `completed` | `paid` | Poster, or system after 72h | — | **Escrow released** to doer minus fee; ratings unlocked |
| `open` | `expired` | System | Past `expires_at`, no acceptance | Pending offers expired; poster notified |
| `open` | `cancelled` | Poster | — | Pending offers withdrawn |
| `assigned` / `in_progress` | `cancelled` | Poster or Doer | Reason required | **Escrow refunded in full**; counterparty notified; recorded on profile |
| `completed` | `disputed` | Poster | Within confirm window | Escrow frozen pending manual review |
| `disputed` | `paid` / `cancelled` | Admin | Resolution recorded | Escrow released or refunded |

**Offer states:** `pending` → `accepted` | `declined` | `withdrawn` | `expired`. Accepting one offer transitions all other pending offers on that quest to `declined`.

> The prototype models only four display steps (Posted → Accepted → Doing → Paid) and can execute none of them. `cancelled`, `expired` and `disputed` have no representation at all today and must be designed.

---

## 9. Target data model

Replaces the prototype's preformatted strings with real types. Money is always `{ minor: integer, currency }`.

**profiles** — `id` · `display_name` · `avatar_url` · `bio` · `verified_at` · `rating_avg` (derived) · `quests_completed` (derived) · `cancellation_rate` (derived) · `home_area` · `created_at`

**quests** — `id` · `poster_id` · `title` · `description` · `category_id` · `payout_minor` · `currency` · `payout_unit` (`fixed`|`hourly`) · `estimated_minutes` · `scheduled_for` (timestamptz) · `address_line` *(private until assigned)* · `location` (geography point) · `status` (enum) · `accepted_offer_id` · `expires_at` · `photos[]` · `requirements[]` · `created_at` · `updated_at`

**offers** — `id` · `quest_id` · `doer_id` · `amount_minor` · `message` · `status` (enum) · `created_at` · `responded_at` · unique on (`quest_id`, `doer_id`) where pending

**threads** — `id` · `quest_id` · `poster_id` · `doer_id` · `last_message_at` · `created_at`

**messages** — `id` · `thread_id` · `sender_id` · `body` · `attachments[]` · `created_at` · `read_at`

**ledger_entries** — `id` · `txn_id` · `account` (`user_available`|`user_held`|`platform_escrow`|`platform_fee`|`external_bank`) · `user_id` · `quest_id` · `direction` · `amount_minor` · `currency` · `created_at`. **Append-only. Entries per `txn_id` must sum to zero. Balances are always derived by summation, never stored.**

**payments** — `id` · `txn_id` · `provider` · `provider_id` · `provider_status` · `state` (`pending`|`succeeded`|`failed`) — the Stripe swap point.

**reviews** — `id` · `quest_id` · `rater_id` · `ratee_id` · `rating` (1–5) · `comment` · `created_at`

**saved_quests** — `user_id` · `quest_id` · `created_at`

**notifications** — `id` · `user_id` · `type` · `payload` · `read_at` · `created_at`

**categories** — `id` · `slug` · `label` · `icon`

---

## 10. Non-functional requirements

- **Performance:** feed first paint under 1s on a mid-range Android over 4G; scrolling stays at 60fps with 200+ items (virtualised list).
- **Offline:** cached feed and threads readable offline; writes queue and retry; no data loss on a dropped connection mid-send.
- **Accessibility:** every control has an accessible label; touch targets ≥ 44pt; text scales with OS settings without clipping; contrast meets WCAG AA for body text. *Note: paper-on-flare fails AA at body size and is restricted to headline scale only.*
- **Privacy:** precise location never stored for browsing, only coarse distance computed server-side; addresses encrypted at rest and access-controlled by RLS; location permission is requested with justification and the app degrades gracefully if denied.
- **Platforms:** iOS 15+, Android 8+, modern evergreen browsers.

---

## 11. Money model

- `Money = { minor: number; currency: 'TWD' }` — integer minor units, never float, never a formatted string in the domain layer.
- **One formatting boundary.** `formatMoney()` is the only place `Intl.NumberFormat` may be called; display omits zero minor units.
- **Fees:** platform fee is a basis-point rate on the accepted amount, `round(minor * bps / 10000)`, remainder favouring the doer. Disclosed before the poster commits.
- **Ledger invariant:** every transaction's entries sum to zero, enforced by test. This is what makes the eventual Stripe swap non-destructive — the ledger stays ours, Stripe becomes only the funding and settlement adapter.

---

## 12. Content and design rules

Carried unchanged from `project/readme.md` — these are already implemented in the design system and remain binding:

- Sentence case everywhere. UPPERCASE only for `Badge` and the 12px meta eyebrow.
- Buttons are verb-first, two or three words, ≤ 18 characters: "Take quest", "Post a quest", "Send offer", "Cash out", "Mark as done". Never "Submit", "Continue", "Learn more".
- Quest titles are verb phrases with an object and a bound: "Walk Biscuit for an hour".
- Money always carries the symbol and is never rounded away. Duration estimates take a `~` prefix. Times in plain words ("Today, 6pm").
- Empty states name the next action. Errors are written as a fix, not a scold. Confirmations are past tense and specific.
- Trust language is factual — "ID verified", "38 quests, 4.9★" — never "safe and secure".
- **No emoji**, anywhere. The rating star is an icon, not a glyph.

---

## 13. Success metrics

**Liquidity (the only metric that matters early)**
- % of posted quests receiving ≥ 1 offer within 1 hour — target 70%
- Median time from post to first offer — target under 20 minutes

**Conversion**
- Post → accepted offer rate — target 60%
- Accepted → completed rate — target 90%

**Trust**
- Cancellation rate after acceptance — keep under 8%
- Dispute rate — keep under 1%
- Mutual rating completion — target 50%

**Retention**
- Doers completing a 2nd quest within 30 days — target 40%
- Posters posting a 2nd quest within 60 days — target 35%

---

## 14. Open questions

1. **Platform fee rate.** Not yet decided. Affects every money screen and the disclosure copy.
2. **Regulatory.** Holding funds between consumers is regulated activity in Taiwan (電子支付機構管理條例). The simulated ledger is unaffected, but real money movement requires legal review **before** the payments phase is scheduled, and determines which Stripe product applies.
3. **Verification.** What actually earns the badge at launch — phone only, or manual review?
4. **Quest expiry default.** 24h? 72h? Until the scheduled time?
5. **Chinese localisation timing.** Seams exist from M1; the translation pass needs a decision on whether it blocks public launch.
6. **Cancellation penalties.** Does a late cancellation cost anything beyond a visible rate?
