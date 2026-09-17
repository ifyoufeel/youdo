/* PRD §11 / ADR-005: "every transaction's entries sum to zero, enforced by
   test. This is what makes the eventual Stripe swap non-destructive."
   These exercise the money layer directly — no React, no screens. */
const H = require("./env");
const { w } = H.boot();

let fails = 0, checks = 0;
function ok(name, cond, extra) {
  checks++;
  if (cond) console.log("  ok   " + name);
  else { console.log("  FAIL " + name + (extra !== undefined ? " :: " + extra : "")); fails++; }
}
const g = (n) => w.eval(n);
const D = w.YOUDO_DATA;
const { feeOn, netOf, postTxn, balanceOf, formatMoney, formatDistance, formatDuration,
        initialState, runClock, ms, CONFIRM_WINDOW_MS, FEE_BPS } =
  Object.fromEntries(["feeOn","netOf","postTxn","balanceOf","formatMoney","formatDistance",
    "formatDuration","initialState","runClock","ms","CONFIRM_WINDOW_MS","FEE_BPS"].map((n) => [n, g(n)]));

function txnSums(ledger) {
  const by = {};
  for (const e of ledger) by[e.txnId] = (by[e.txnId] || 0) + e.amountMinor;
  return by;
}

console.log("== the invariant ==");
const seeded = txnSums(D.ledger);
const badSeed = Object.entries(seeded).filter(([, v]) => v !== 0);
ok(Object.keys(seeded).length + " seeded transactions all sum to zero", badSeed.length === 0, JSON.stringify(badSeed));

/* Every entry ever written, across every account, must also net to zero —
   money is only ever moved, never created. */
const total = D.ledger.reduce((s, e) => s + e.amountMinor, 0);
ok("the whole ledger nets to zero", total === 0, total);

console.log("\n== the guard refuses unbalanced writes ==");
const before = [];
const errs = [];
const origErr = console.error;
console.error = (...a) => errs.push(a.join(" "));
const afterBad = postTxn(before, "tx-bad", "2026-09-16T09:00:00+08:00", [
  { account: "user_available", userId: "u0", amountMinor: -100, memo: "x" },
  { account: "user_held", userId: "u0", amountMinor: 99, memo: "x" }
]);
console.error = origErr;
ok("an unbalanced transaction is rejected, not written", afterBad.length === 0);
ok("and it says so rather than failing silently", errs.some((e) => /does not sum to zero/.test(e)));

const afterGood = postTxn([], "tx-good", "2026-09-16T09:00:00+08:00", [
  { account: "user_available", userId: "u0", amountMinor: -40000, memo: "Held for a quest" },
  { account: "user_held", userId: "u0", amountMinor: 40000, memo: "Held for a quest" }
]);
ok("a balanced transaction is written in full", afterGood.length === 2);
ok("entries are stamped with their transaction", afterGood.every((e) => e.txnId === "tx-good"));

console.log("\n== fee arithmetic (PRD §11) ==");
ok("fee rate is a basis-point constant", typeof FEE_BPS === "number");
let feeBad = [];
for (let minor = 1; minor <= 200000; minor += 137) {
  const fee = feeOn(minor), net = netOf(minor);
  if (fee + net !== minor) feeBad.push(minor + ": " + fee + "+" + net);
  if (fee < 0 || fee > minor) feeBad.push(minor + ": fee out of range " + fee);
  /* The remainder favours the doer, so the fee never rounds up. */
  if (fee > Math.floor(minor * FEE_BPS / 10000)) feeBad.push(minor + ": fee rounded up");
}
ok("fee + net === gross for every amount tested, remainder to the doer", feeBad.length === 0, feeBad.slice(0, 3).join("; "));
ok("no fractional minor units are ever produced",
   Number.isInteger(feeOn(33333)) && Number.isInteger(netOf(33333)));

console.log("\n== derived balances, never stored ==");
const st = initialState();
ok("no account balance is stored on a user record",
   Object.values(D.users).every((u) => u.availableMinor === undefined && u.heldMinor === undefined));
const alexAvail = balanceOf(st.ledger, "user_available", "u0");
/* 6840 opening - 1500 cashed out + 315 paid in - 300 held for q7 = 5355 */
ok("Alex's available balance derives to NT$5,355", alexAvail === 535500, formatMoney(alexAvail));
ok("Alex has NT$300 held for the quest awaiting his confirm",
   balanceOf(st.ledger, "user_held", "u0") === 30000, formatMoney(balanceOf(st.ledger, "user_held", "u0")));
ok("the platform has collected NT$35 in fees so far",
   balanceOf(st.ledger, "platform_fee", null) === 3500, formatMoney(balanceOf(st.ledger, "platform_fee", null)));

console.log("\n== the clock pays people nobody confirmed ==");
const q7 = st.quests.find((q) => q.id === "q7");
const past = Object.assign({}, st, { now: ms(q7.completedAt) + CONFIRM_WINDOW_MS + 1000 });
const after = runClock(past);
const releasedQuest = after.quests.find((q) => q.id === "q7");
ok("a completed quest past its window auto-pays", releasedQuest.status === "paid", releasedQuest.status);
const newTxns = txnSums(after.ledger.slice(st.ledger.length));
ok("the auto-release transaction sums to zero", Object.values(newTxns).every((v) => v === 0), JSON.stringify(newTxns));
ok("the doer received the amount minus the fee",
   balanceOf(after.ledger, "user_available", "u5") - balanceOf(st.ledger, "user_available", "u5") === netOf(30000));
ok("the poster's hold was cleared", balanceOf(after.ledger, "user_held", "u0") === 0);
ok("the whole ledger still nets to zero after the release",
   after.ledger.reduce((s, e) => s + e.amountMinor, 0) === 0);
/* That same jump also expires other quests, so count the ones about q7. */
const q7Notes = after.notifications.slice(st.notifications.length).filter((n) => n.questId === "q7");
ok("both sides were told about the auto-release",
   q7Notes.length === 2 && q7Notes.every((n) => n.type === "payment"),
   JSON.stringify(q7Notes.map((n) => n.userId + ":" + n.type)));
ok("the doer's notice names the amount that landed",
   q7Notes.some((n) => n.userId === "u5" && n.body.includes(formatMoney(netOf(30000)))));

const expiredQuest = after.quests.find((q) => q.id === "q2");
ok("an open quest past its expiry expires", expiredQuest.status === "expired", expiredQuest.status);
ok("its pending offers expire with it",
   after.offers.filter((o) => o.questId === "q2").every((o) => o.status === "expired"));

console.log("\n== the one formatting boundary ==");
ok('TWD drops zero minor units: NT$400', formatMoney(40000) === "NT$400", formatMoney(40000));
ok('and keeps them when they are not zero', formatMoney(40050) === "NT$400.50", formatMoney(40050));
ok("thousands are grouped", formatMoney(535500) === "NT$5,355", formatMoney(535500));
ok("negatives use a minus sign, not a hyphen", formatMoney(-15000).startsWith("−"), formatMoney(-15000));
ok("distance is coarse and honest: 3.1 km stays 3.1 km", formatDistance(3140) === "3.1 km", formatDistance(3140));
ok("short distances round to 100 m", formatDistance(640) === "600 m", formatDistance(640));
ok("durations carry the ~ prefix", formatDuration(45) === "~45 min", formatDuration(45));

console.log("\n" + checks + " checks, " + fails + " failed");
process.exit(fails ? 1 : 0);
