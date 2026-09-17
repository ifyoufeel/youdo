# YouDO

A peer-to-peer quest marketplace for Taipei. Neighbours post small paid jobs;
people nearby take them on. Both sides are ordinary people, and the money is
held in escrow between them — that is the whole product.

- **[docs/PRD.md](docs/PRD.md)** — what it is and what it must do
- **[docs/ROADMAP.md](docs/ROADMAP.md)** — nine milestones, each a clickable slice
- **[docs/DECISIONS.md](docs/DECISIONS.md)** — settled decisions, so they stay settled
- **[docs/SELF-CHECK.md](docs/SELF-CHECK.md)** — what the rules are and how they're held

## Layout

```
preview/   the clickable preview — plain scripts in a page, no build step
  index.html          page shell and phone frame
  tokens/*.css        the design tokens; the only source of colour and size
  ds-bundle.js        the exported design system, loaded as published
  data.taiwan.js      the seed fixture — Taipei, TWD, integer minor units
  app.js              the store, the screens and the preview galleries
test/      jsdom suites that drive the preview by clicking
docs/      the PRD, the roadmap, the decision log and the self-check
```

## Running it

The preview is static. Serve the folder and open it:

```
cd preview && python3 -m http.server 8000
```

React comes from a CDN, so a sandbox without egress renders a blank page — see
`test/README.md` for the offline swap.

```
cd test && npm install && npm test
```

## What the preview does

Four surfaces, chosen by the tabs in the page chrome:

- **Prototype** — the app. Five tabs, the full quest lifecycle, both sides.
- **Flows** — nine scripted steps from an empty feed to two ratings, alternating
  between poster and doer, against a real store with the ledger checked at every
  hop.
- **Components / Tokens / States** — every component in every state, the token
  specimens, and the lifecycle states the prototype had no picture of.

Above the phone sit two controls that exist only here: **who you are** and
**what time it is**. Both are load-bearing for review — see ADR-008 and ADR-009.

## The parts that are not negotiable

Money is `{ minor, currency }` in integer minor units and is formatted in
exactly one function. The ledger is append-only and every transaction's entries
sum to zero, checked where they are written and again in `test/ledger.js`.
Balances are derived by summation, never stored. The exact address is a function
of who is asking and what state the quest is in. Every lifecycle transition is
checked against PRD §8 with the actor's role, so an illegal one is both
unreachable and refused.
