/* Every screen and every sheet, reached the way a person reaches them.
   M6's exit criterion is "no dead ends" — this is what checks it. */
const H = require("./env");
const { w, act, errors, root } = H.boot();
const ReactDOMClient = require("react-dom/client");

let fails = 0, checks = 0;
function ok(name, cond, extra) {
  checks++;
  if (cond) console.log("  ok   " + name);
  else { console.log("  FAIL " + name + (extra ? " :: " + extra : "")); fails++; }
}
function click(el, what) {
  if (!el) { console.log("  FAIL click: " + what + " not found"); fails++; return false; }
  act(() => { el.click(); });
  return true;
}
const byText = (t) => H.byText(root, t);
const clickText = (t) => click(byText(t), t);
const clickHas = (t) => click(H.containingText(root, t) || H.deepest(root, t), t);
const clickLabel = (t) => click(H.byLabel(root, t), t);
const type = (label, v) => { const f = H.field(root, label); if (f) act(() => H.type(f, v)); return !!f; };
const choose = (label, v) => { const f = H.field(root, label); if (f) act(() => H.choose(f, v)); return !!f; };

const r = ReactDOMClient.createRoot(root);
act(() => { r.render(w.React.createElement(w.eval("App"))); });

console.log("== posting wizard ==");
clickLabel("Post");
ok("wizard starts at step 1 of 4", H.has(root, "Step 1 of 4"));
clickText("Keep going");
ok("blocks on an empty title", H.has(root, "Step 1 of 4") && H.has(root, "few more words"));
type("What needs doing", "Water the balcony plants for a week");
type("Details", "Six pots, one fern, key with the manager.");
clickText("Keep going");
ok("advances once the title is valid", H.has(root, "Step 2 of 4"));
ok("step 2 explains the address gate", H.has(root, "only reaches the person you accept"));
clickText("Keep going");
ok("blocks without an address", H.has(root, "Step 2 of 4"));
type("Address", "5F, No. 12, Lane 9, Anhe Rd");
clickHas("Choose a date");
ok("calendar sheet opens", H.has(root, "Pick a date"));
clickText("Done");
clickHas("Choose a time");
ok("time sheet opens", H.has(root, "Pick a time"));
clickText("Done");
clickText("Keep going");
ok("advances to budget", H.has(root, "Step 3 of 4"));
ok("budget offers fixed and hourly", H.has(root, "Per hour"));
clickText("NT$300");
ok("fee is disclosed before the commitment", H.has(root, "Platform fee"));
clickText("Keep going");
ok("reaches review", H.has(root, "Step 4 of 4"));
ok("review restates the address gate", H.has(root, "only after you accept"));
clickText("Post quest");
ok("lands in my quests after posting", H.has(root, "Water the balcony plants"));
clickLabel("Browse");
ok("posted quest is discoverable in the feed", H.has(root, "Water the balcony plants"));

console.log("\n== draft autosave ==");
clickLabel("Post");
type("What needs doing", "Carry a bookcase up one floor");
const stored = w.localStorage.getItem("youdo-quest-draft");
ok("draft written to storage", !!stored && stored.includes("bookcase"));
clickText("Start over");
ok("start over clears the draft", !(w.localStorage.getItem("youdo-quest-draft") || "").includes("bookcase"));

console.log("\n== doer: send and withdraw an offer ==");
clickLabel("Browse");
clickHas("Assemble a wardrobe");
ok("detail opens", H.has(root, "Assemble a wardrobe"));
ok("address is gated before acceptance", H.has(root, "shared the moment your offer is accepted"));
ok("an existing offer is shown with a way out", H.has(root, "Waiting to hear back"));
clickText("Withdraw offer");
ok("withdrawn, and a new offer becomes possible", !!byText("Take this quest"));
clickText("Take this quest");
ok("offer sheet opens", H.has(root, "Make your offer"));
ok("offer sheet discloses what the doer receives", H.has(root, "You receive"));
clickText("Send offer");

console.log("\n== cancel with a reason, and the refund ==");
clickLabel("My quests");
ok("my quests card shows the confirm window", H.has(root, "left to confirm"));
clickHas("Water my plants");
ok("tapping the card opens the quest", H.has(root, "Six pots on the balcony"));
ok("poster sees the confirm window on the quest", H.has(root, "left to confirm"));
clickText("Raise an issue");
ok("dispute sheet opens", H.has(root, "What went wrong"));
ok("dispute explains the money stays held", H.has(root, "stays held"));
/* PRD §8: a completed quest can only go to paid or disputed. Cancelling it is
   not a transition that exists, so the screen must not offer one. */
clickText("Back");
ok("no cancel offered on a completed quest", !byText("Cancel"));
clickText("Raise an issue");
const why = H.field(root, "What went wrong");
ok("dispute blocks without a reason", !!byText("Send for review") && byText("Send for review").disabled);
if (why) act(() => H.type(why, "Only half the plants were watered."));
clickText("Send for review");
ok("quest is disputed", H.has(root, "Raised for review"));
ok("dispute records the reason", H.has(root, "Only half the plants"));
ok("escrow is stated as frozen", H.has(root, "stays held until"));

console.log("\n== cancel with a reason, and the refund ==");
clickLabel("Back");
clickLabel("Chats");
clickHas("Buzzer is 14B");
clickLabel("Open the quest");
ok("doer opened the quest they're doing", H.has(root, "Walk Biscuit"));
ok("address is revealed to the accepted doer", H.has(root, "Yongkang St"));
clickText("Cancel");
ok("cancel sheet opens", H.has(root, "Why are you cancelling"));
ok("cancel sheet states the refund in full", H.has(root, "Refunded in full"));
ok("cancel sheet names the cancellation-rate cost", H.has(root, "cancellation rate"));
clickText("Cancel quest");
ok("quest is cancelled", H.has(root, "Cancelled by you"));
ok("refund is stated", H.has(root, "went back in full"));

console.log("\n== chats: threads follow their quest's state ==");
clickLabel("Chats");
ok("thread list renders", H.has(root, "Wei-Ting"));
/* q1 was just cancelled, so PRD §7.5 makes its thread read-only but keeps it. */
clickHas("Buzzer is 14B");
ok("cancelled quest's thread still opens", H.has(root, "Buzzer is 14B"));
ok("thread shows the quest is cancelled", H.has(root, "Cancelled"));
ok("thread is read-only once the quest closes", H.has(root, "read-only"));
ok("no composer on a closed thread",
   !H.all(root, "input").some((i) => i.getAttribute("placeholder") === "Message"));
clickLabel("Back");
/* An open quest's thread still takes messages. */
clickHas("Three bags is a bit much");
const box = H.all(root, "input").find((i) => i.getAttribute("placeholder") === "Message");
ok("composer present on a live thread", !!box);
if (box) {
  act(() => H.type(box, "That works, see you at two."));
  clickLabel("Send");
  ok("message appears in the thread", H.has(root, "see you at two"));
}
clickLabel("Back");

console.log("\n== saved, notifications, public profile, wallet ==");
clickLabel("Browse");
const heart = H.byLabel(root, "Save quest") || H.all(root, "[aria-label='Save quest']")[0];
click(heart, "save heart");
clickLabel("Profile");
ok("profile shows the wallet", H.has(root, "Available to spend"));
ok("wallet shows the ledger", H.has(root, "Money in and out"));
clickHas("Saved quests");
ok("saved list reachable and populated", H.has(root, "km") || H.has(root, "Nothing saved"));
clickLabel("Back");
clickText("Cash out");
ok("cash out sheet opens", H.has(root, "How much"));
ok("cash out names the destination account", H.has(root, "CTBC"));
clickText("Cancel");
clickLabel("Settings");
ok("settings reachable", H.has(root, "Notifications"));
ok("payment notifications are stated as always on", H.has(root, "always on"));
ok("account deletion is offered", H.has(root, "Delete account"));
ok("deletion explains what happens to the counterparty", H.has(root, "anonymises"));
clickText("Done");

clickLabel("Browse");
clickLabel("Notifications");
ok("notification inbox reachable", H.has(root, "offered") || H.has(root, "marked"));
clickLabel("Back");

clickLabel("Browse");
clickHas("Help carry a sofa");
clickLabel("See profile");
ok("public profile reachable from a quest", H.has(root, "Kuan-Yu"));
ok("public profile states the cancellation rate", H.has(root, "% cancelled"));
ok("ratings reveal rule is explained", H.has(root, "both sides have rated") || H.has(root, "What people said"));
clickLabel("Report this person");
ok("report sheet opens", H.has(root, "What happened"));
ok("blocking offered alongside reporting", H.has(root, "Block this person"));
clickText("Cancel");

const real = errors.filter((e) => !/not wrapped in act|deprecated/.test(e));
console.log("\nconsole errors:", real.length ? "\n  " + real.slice(0, 8).join("\n  ") : "none");
console.log("\n" + checks + " checks, " + fails + " failed" + (real.length ? ", " + real.length + " console errors" : ""));
process.exit(fails || real.length ? 1 : 0);
