# YouDO — handoff

Read this first, then `PRD.md` for what the product must do and `DECISIONS.md`
for what is already settled. This file is the state of play, not a spec.

**Repo:** `github.com/ifyoufeel/youdo`, branch `claude/lucid-hawking-mpwjz0`
**Preview:** https://claude.ai/artifact/6FhfwuyCdugQ69wvK9eTvD (v23)

---

## What exists

A clickable, two-sided preview of the whole quest lifecycle. Plain scripts in a
page — no build step, no framework beyond React from a CDN.

```
preview/
  index.html        page shell and the 390px phone frame
  tokens/*.css      design tokens — the only source of colour and size
  ds-bundle.js      the exported design system, loaded as published
  data.taiwan.js    seed fixture: Taipei, TWD, integer minor units
  app.js            the store, the screens, the preview galleries  (~5,400 lines)
test/               jsdom suites + a browser layout check
docs/               PRD, roadmap, decision log, self-check, this file
```

`app.js` is one file in loose sections, in this order: shared helpers and
formatters · the store · lifecycle UI parts · browse · quest detail · pickers ·
post wizard · offer inbox, my quests, chats · profile, saved, notifications ·
the shell · the galleries. Search for `/* ---------------- ` to find a section.

### The four preview surfaces

Tabs in the page chrome: **Prototype** (the app), **Flows** (nine scripted steps
across both sides against a real store), **Components**, **Tokens**, **States**.

Above the phone sit two dev-only controls — **who you are** and **what time it
is**. Both are load-bearing for review: you cannot review two-sided software
from one chair (ADR-008), and you cannot review a 72-hour window without
reaching the far side of it (ADR-009).

---

## The parts that are not negotiable

These are enforced, not just intended. Breaking one fails a test.

- **Money is `{ minor, currency }`** in integer minor units, formatted in
  exactly one function. No `Intl.NumberFormat` anywhere else.
- **The ledger is append-only** and every transaction's entries sum to zero,
  checked where they are written *and* in `test/ledger.js`. Balances are derived
  by summation, never stored.
- **The address is a function** of who is asking and what state the quest is in
  — `addressVisibleTo()`. Not a flag.
- **Every lifecycle transition** is checked against PRD §8 with the actor's
  role, so an illegal one is both unreachable and refused.
- **Time is a value in the store**, never `Date.now()`. One careless `new Date()`
  breaks the clock control and the 72-hour window with it.
- **One price per quest** (ADR-011). The duration estimate prices nothing.

---

## Running it

```
cd preview && python3 -m http.server 8000
```

React comes from a CDN, so a sandbox without egress renders a blank page — that
is the network, not the app. `test/README.md` has the offline swap.

```
cd test && npm install && npm test          # 152 checks, jsdom
```

The layout check is separate because it needs a server and a browser:

```
cd preview && python3 -m http.server 8732 &
cd test && YOUDO_URL=http://127.0.0.1:8732/index.html node layout.js
```

**jsdom does no layout.** Three overflow bugs reached review before that check
existed. Run it before signing off on a screen, and per ADR-001 sign off
typography and gestures on a device, not on the web.

---

## Decisions you still owe

Both are one-line changes that have been deferred since the PRD was written.

| | Where | Currently |
|---|---|---|
| **Platform fee rate** (PRD §14.1) | `FEE_BPS` in `preview/app.js` | 1000 = 10%, shown to users as "Platform fee (10%)" |
| **Default quest expiry** (PRD §14.4) | `EXPIRY_OPTIONS` in `preview/app.js` | "An hour before it starts" |

Three more from PRD §14 that are not blocking the preview: what earns the
verification badge, whether Chinese localisation blocks launch, and whether a
late cancellation costs anything beyond a visible rate.

---

## What to build next

The roadmap's milestone order still holds. Realistically:

1. **M1 — auth and onboarding.** The only wholly missing milestone. The preview
   starts signed in; there is no sign-in screen, no first-run explainer, no
   location permission request. Everything else assumes an identity that the
   actor switcher currently supplies.
2. **M5 — `pending` payments.** ADR-005 says every payment passes through
   `pending` even in the mock, because Stripe's transitions are webhook-driven.
   Nothing does yet. It applies to the hold, the release, the refund, the
   deposit and the cash-out.
3. **M3 leftovers.** The photo picker — there is no image handling anywhere.
4. **M7 — Supabase.** Untouched by design. The store's shape is what the ports
   have to match; no screen reaches past it into a table, so the swap should
   touch no feature code. The M3 spike (PostGIS radius query, chat RLS policy)
   has not been done and was meant to de-risk this.

### One known gap with no owner

`disputed → paid` and `disputed → cancelled` are in the transition table and
refused for everyone, because they need an admin actor the product does not
have. The frozen-escrow state is reachable and designed; resolving it is not.

---

## How the review loop has been working

Comments on the artifact come back as threads; each one gets a fix, a reply
saying what changed and why, and a resolve. Twenty-three versions so far. Two
things that kept being worth doing:

- **Measure before fixing.** "The buttons don't fit" became "the slab has 346px
  of inner width and the money button overflows by 38px", which made the fix
  obvious and the regression testable.
- **Check the resolved threads before a large rewrite.** The M4 rewrite silently
  reverted three settled profile decisions. Nothing caught it but re-reading the
  old threads.
