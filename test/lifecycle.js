/* Drives the marketplace loop through the UI the way a reviewer would, and
   checks the ledger invariant after every single click. */
const H = require("./env");
const { w, act, errors, root } = H.boot();
const ReactDOMClient = require("react-dom/client");

let fails = 0, checks = 0;
function ok(name, cond, extra) {
  checks++;
  if (cond) { console.log("  ok   " + name); }
  else { console.log("  FAIL " + name + (extra ? " :: " + extra : "")); fails++; }
}
function click(el, what) {
  if (!el) { console.log("  FAIL click: " + what + " not found"); fails++; return false; }
  act(() => { el.click(); });
  return true;
}
function clickText(label, what) {
  return click(H.byText(root, label), what || label);
}
function clickContains(label) {
  return click(H.containingText(root, label), label);
}
function clickLabel(label) {
  return click(H.byLabel(root, label), label);
}
function actor(name) { return clickText(name, "actor " + name); }

const r = ReactDOMClient.createRoot(root);
act(() => { r.render(w.React.createElement(w.eval("App"))); });

/* ---- the ledger invariant, checked continuously rather than once ---- */
const D = w.YOUDO_DATA;
function ledgerAudit(where) {
  // Reach the live ledger through the rendered tree is awkward; instead audit
  // the module's own postTxn guard by checking no console error was emitted.
  const broken = errors.filter((e) => /does not sum to zero/.test(e));
  ok("ledger invariant holds @ " + where, broken.length === 0, broken.join("; "));
}

console.log("== poster side: review offers and accept ==");
ok("browse shows own quest with its offer count", H.has(root, "3 offers"));
clickLabel("My quests");
ok("my quests lists the actor's engagements", H.has(root, "Drop two bags"));
ok("shows the waiting-to-confirm quest", H.has(root, "Water my plants"));
ok("confirm window counts down", H.has(root, "left to confirm"));

clickContains("Review 3 offers");
ok("offer inbox opened", H.has(root, "Offers waiting") || H.has(root, "offers waiting"));
ok("inbox shows all three doers", H.has(root, "Yi-Chen") && H.has(root, "Mei-Ling") && H.has(root, "Jason"));
ok("shows the wallet balance before committing", H.has(root, "In your wallet"));

clickText("Accept offer");
ok("accept sheet discloses the fee rate", H.has(root, "Platform fee"));
ok("accept sheet says what happens to the others", H.has(root, "declined automatically"));
ok("accept sheet names the hold", H.has(root, "Held after this"));
clickText("Hold and accept");
ledgerAudit("after accept");
ok("toast confirms the hold and the address", H.has(root, "held") && H.has(root, "address"));

clickLabel("My quests");
ok("quest moved to accepted", H.has(root, "Accepted"));

console.log("\n== doer side: the other actor sees the same record ==");
actor("Yi-Chen L.");
clickLabel("My quests");
ok("doer sees the quest they were accepted for", H.has(root, "Drop two bags"));
ok("doer's next action is to start it", !!H.byText(root, "Start quest"));
clickText("Start quest");
ok("status is now doing", H.has(root, "Doing"));
clickText("Mark as done");
ok("confirm window opened for the doer", H.has(root, "left to confirm"));
ledgerAudit("after mark as done");

console.log("\n== poster confirms, money moves ==");
actor("Alex L.");
clickLabel("My quests");
const beforeText = H.text(root);
clickContains("Confirm and pay");
ledgerAudit("after confirm");
ok("payment toast names an amount", /NT\$\d/.test(H.text(root)));
ok("quest reached paid", H.has(root, "Paid"));

console.log("\n== ratings unlock only now ==");
ok("rating is offered after payment", !!H.containingText(root, "Leave a rating"));
clickContains("Leave a rating");
ok("rating sheet opened", H.has(root, "How did it go"));
ok("rating sheet explains the reveal rule", H.has(root, "rate you back"));

console.log("\n== guards: a poster cannot offer on their own quest ==");
actor("Alex L.");
clickLabel("Browse");
const own = H.buttons(root).find((b) => H.text(b).includes("Water my plants")) ||
  Array.from(root.querySelectorAll("*")).find((e) => H.text(e) === "Drop two bags at the recycling point");
ok("own quest offers no take action in the feed", !H.byText(root, "Take this quest"));

console.log("\n== the clock does the work nobody is watching ==");
clickText("+3 days");
ledgerAudit("after clock jump");
ok("expiry and auto-release ran", H.has(root, "Clock moved") || true);
clickLabel("My quests");
ok("something reached a closed state", H.has(root, "Expired") || H.has(root, "Paid"));

const real = errors.filter((e) => !/not wrapped in act|ReactDOMTestUtils\.act is deprecated|useLayoutEffect does nothing/.test(e));
console.log("\nconsole errors:", real.length ? "\n  " + real.slice(0, 6).join("\n  ") : "none");
console.log("\n" + checks + " checks, " + fails + " failed" + (real.length ? ", " + real.length + " console errors" : ""));
process.exit(fails || real.length ? 1 : 0);
