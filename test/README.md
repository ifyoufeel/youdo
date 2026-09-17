# Preview tests

The preview is plain scripts in a page, so these boot it in jsdom and drive it
by clicking, rather than testing a build step that doesn't exist.

```
cd test && npm install && npm test
```

| Suite | What it holds to |
|---|---|
| `smoke` | The app mounts and every gallery view renders. |
| `lifecycle` | The loop closes: offer → accept → start → done → confirm → rate, across two actors, with the ledger audited after every click. |
| `screens` | Every screen and sheet is reachable, and the guards refuse what PRD §8 forbids. This is M6's "no dead ends" criterion. |
| `rules` | The design-system and content rules — tokens, the money boundary, icon names, no emoji, sentence case, button length, contrast. |
| `ledger` | PRD §11: entries sum to zero per transaction, balances derive, fees favour the doer, the 72-hour window pays out on its own. |

`env.js` boots the page and holds the query helpers. Nothing here mocks the
design system — `ds-bundle.js` is loaded as published, so a break in a
component fails these tests too.

Two notes on the environment:

- **jsdom does no layout**, so these catch behaviour and copy, not overflow. A
  real browser pass found two layout bugs these could not have. Run one before
  signing off on a screen.
- `index.html` loads React from a CDN. In a sandbox without egress the page
  renders blank — that is the network, not the app. Point the two script tags
  at local copies of `react.production.min.js` and `react-dom.production.min.js`
  to look at it offline.
