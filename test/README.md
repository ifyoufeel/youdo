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
| `layout` | **Browser, not jsdom.** Walks the screens and sheets in Chromium and fails if any in-flow child crosses its flex parent's content box. Run separately — see below. |

`env.js` boots the page and holds the query helpers. Nothing here mocks the
design system — `ds-bundle.js` is loaded as published, so a break in a
component fails these tests too.

## The layout check

`npm test` does not run it, because it needs a server and a browser:

```
cd ../preview && python3 -m http.server 8732 &
cd ../test && YOUDO_URL=http://127.0.0.1:8732/index.html node layout.js
```

Set `CHROMIUM` if Playwright's own download is missing (in this sandbox:
`/opt/pw-browsers/chromium`).

It measures at a 1180px viewport so the phone frame renders at its real 390px
width rather than going full-bleed under the 620px media query — the overflow
only exists at phone width. Children that are absolutely positioned (the
notification badge) or transformed (the rating star's tilt) are skipped: both
sit outside their parent's box on purpose.

Two notes on the environment:

- **jsdom does no layout.** The four suites above catch behaviour and copy; a
  button pushed off the edge of its slab is invisible to them. That is what
  `layout.js` is for, and it was written after review caught exactly that twice.
- `index.html` loads React from a CDN. In a sandbox without egress the page
  renders blank — that is the network, not the app. Point the two script tags
  at local copies of `react.production.min.js` and `react-dom.production.min.js`
  to look at it offline.
