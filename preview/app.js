/* Generated from preview/src/*.jsx — do not edit by hand. */

/* ==== 01-shared.jsx ==== */
/* YouDO M0 preview — shared layer.
   Loads the real exported design system; nothing here re-implements a component. */

var DS = window.YouDODesignSystem_ea424c;
var Button = DS.Button,
  IconButton = DS.IconButton,
  Icon = DS.Icon,
  Badge = DS.Badge,
  Tag = DS.Tag,
  Avatar = DS.Avatar,
  Input = DS.Input,
  Select = DS.Select,
  Checkbox = DS.Checkbox,
  Radio = DS.Radio,
  Switch = DS.Switch,
  Card = DS.Card,
  Dialog = DS.Dialog,
  Toast = DS.Toast,
  Tooltip = DS.Tooltip,
  TabBar = DS.TabBar,
  Tabs = DS.Tabs,
  TopBar = DS.TopBar,
  QuestCard = DS.QuestCard,
  RewardPill = DS.RewardPill,
  StatusTrack = DS.StatusTrack,
  UserChip = DS.UserChip;
var D = window.YOUDO_DATA;

/* ---- the one formatting boundary ----
   Domain code passes integer minor units and metres; only these three functions
   turn them into strings. TWD is transacted in whole dollars, so minor units are
   dropped when zero. */
function formatMoney(minor) {
  var neg = minor < 0;
  var whole = Math.abs(minor) / 100;
  var s = whole % 1 === 0 ? String(whole) : whole.toFixed(2);
  s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "−" : "") + "NT$" + s;
}
function formatDistance(m) {
  return m >= 1000 ? (m / 1000).toFixed(1) + " km" : Math.round(m / 100) * 100 + " m";
}
function formatDuration(min) {
  return min >= 120 ? "~" + Math.round(min / 60) + " hr" : "~" + min + " min";
}
function addDaysISO(iso, days) {
  var p = iso.split("-").map(Number);
  var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  d.setUTCDate(d.getUTCDate() + days);
  return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
}
function weekdayShort(iso) {
  var p = iso.split("-").map(Number);
  var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
}
function formatTime12(hhmm) {
  var p = hhmm.split(":");
  var h = parseInt(p[0], 10);
  var m = parseInt(p[1], 10);
  var ap = h >= 12 ? "pm" : "am";
  var h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return h12 + (m ? ":" + String(m).padStart(2, "0") : "") + ap;
}
/* ---- readability: Display / Title text scale ----
   A per-viewer size preference for the two largest type roles. Reads/writes
   the actual --type-display-size / --type-title-size tokens from
   tokens/typography.css on document.documentElement, so every place that is
   styled from those role tokens (not a hardcoded --text-* value) follows the
   choice live — this is the "synced with the library" part. Persisted to
   localStorage per viewer; never assume it is there. */
var TYPE_SCALE_STORAGE_KEY = "youdo-type-scale";
var TYPE_SCALE_OPTIONS = [{
  value: "sm",
  label: "S"
}, {
  value: "md",
  label: "M"
}, {
  value: "lg",
  label: "L"
}];
var DISPLAY_SIZE_BY_SCALE = {
  sm: "var(--text-4xl)",
  md: "var(--text-5xl)",
  lg: "var(--text-6xl)"
};
var TITLE_SIZE_BY_SCALE = {
  sm: "var(--text-xl)",
  md: "var(--text-2xl)",
  lg: "var(--text-3xl)"
};
function applyTypeScale(scale) {
  try {
    document.documentElement.style.setProperty("--type-display-size", DISPLAY_SIZE_BY_SCALE[scale.display] || DISPLAY_SIZE_BY_SCALE.md);
    document.documentElement.style.setProperty("--type-title-size", TITLE_SIZE_BY_SCALE[scale.title] || TITLE_SIZE_BY_SCALE.md);
  } catch (e) {}
  try {
    localStorage.setItem(TYPE_SCALE_STORAGE_KEY, JSON.stringify(scale));
  } catch (e) {}
}
function loadTypeScale() {
  try {
    var raw = localStorage.getItem(TYPE_SCALE_STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      return {
        display: DISPLAY_SIZE_BY_SCALE[parsed.display] ? parsed.display : "md",
        title: TITLE_SIZE_BY_SCALE[parsed.title] ? parsed.title : "md"
      };
    }
  } catch (e) {}
  return {
    display: "md",
    title: "md"
  };
}
function userOf(id) {
  return D.users[id];
}
function categoryLabel(id) {
  for (var i = 0; i < D.categories.length; i++) if (D.categories[i].id === id) return D.categories[i].label;
  return id;
}
function posterProp(u) {
  return {
    name: u.name,
    rating: u.rating,
    quests: u.questsCompleted,
    verified: u.verified
  };
}
/* The 12px meta eyebrow — with Badge, the only place the system allows
   uppercase. Written longhand rather than as a `font:` shorthand so its size
   is visible to the content-rule check, which is what keeps the rule true. */
var SECTION_LABEL = {
  fontFamily: "var(--font-text)",
  fontSize: "var(--text-2xs)",
  fontWeight: "var(--weight-bold)",
  lineHeight: 1,
  letterSpacing: "var(--tracking-caps)",
  textTransform: "uppercase",
  color: "var(--ink-400)"
};

/* Scroll body shared by every screen: content between the fixed top bar and tab bar. */
function Body(props) {
  return React.createElement("div", {
    className: "screen-body",
    style: Object.assign({
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "16px var(--gutter-screen) 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }, props.style)
  }, props.children);
}

/* Sticky bottom action slab with the ink top rule. */
function Slab(props) {
  return React.createElement("div", {
    style: {
      padding: "12px var(--gutter-screen)",
      background: "var(--paper-000)",
      borderTop: "var(--border-width) solid var(--border-strong)",
      display: "flex",
      alignItems: "center",
      gap: 10,
      flex: "none"
    }
  }, props.children);
}

/* ---- the three states the prototype never had ---- */

function LoadingState(props) {
  /* The system bans skeleton shimmer: a sunken card with a line of text instead. */
  return React.createElement(Card, {
    variant: "sunken",
    padding: "lg"
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, React.createElement(Icon, {
    name: "clock",
    size: 17,
    color: "var(--ink-400)"
  }), React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)"
    }
  }, props.label || "Finding quests near you…")));
}
function EmptyState(props) {
  /* Names the next action, never just reports emptiness. */
  return React.createElement(Card, {
    variant: "sunken",
    padding: "lg"
  }, React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      alignItems: "flex-start"
    }
  }, React.createElement("span", {
    style: {
      fontSize: "var(--text-md)",
      fontWeight: "var(--weight-semibold)"
    }
  }, props.title), props.action ? React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    onClick: props.onAction
  }, props.action) : null));
}
function ErrorState(props) {
  /* Written as a fix, not a scold. */
  return React.createElement(Card, {
    padding: "lg"
  }, React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      alignItems: "flex-start"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "flex-start"
    }
  }, React.createElement(Icon, {
    name: "alert-triangle",
    size: 18,
    color: "var(--danger-600)",
    style: {
      marginTop: 1
    }
  }), React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-normal)"
    }
  }, props.message || "We couldn't reach the quest list. Check your connection and try again.")), React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    icon: "zap",
    onClick: props.onRetry
  }, "Try again")));
}


/* ==== 02-prototype.jsx ==== */
/* YouDO M4 preview — the clickable prototype, now two-sided.

   M0 proved the design system survived the port. M4 closes the marketplace
   loop: offers are records, the PRD §8 lifecycle is an actual state machine
   with per-actor guards, and escrow is arithmetic on an append-only ledger
   whose entries sum to zero per transaction.

   Everything runs on local state — no network, no persistence.

   The new code below is hand-written rather than compiled from JSX, and uses
   `h` for React.createElement so a screen fits on a screen. */

var h = React.createElement;
var Fragment = React.Fragment;

/* ---------------- Money ----------------
   PRD §11 / ADR-005. The rate itself is PRD §14.1's first open question; it
   lives here as one basis-point constant so deciding it is a one-line change
   and every screen that discloses the fee follows. */
var FEE_BPS = 1000; /* 10.0% — provisional, see PRD §14.1 */
function feeRateLabel() {
  return (FEE_BPS / 100).toFixed(FEE_BPS % 100 === 0 ? 0 : 1) + "%";
}
/* The remainder favours the doer, so the fee floors rather than rounds. */
function feeOn(minor) {
  return Math.floor(minor * FEE_BPS / 10000);
}
function netOf(minor) {
  return minor - feeOn(minor);
}

/* ---------------- Time ----------------
   The preview owns a clock it can wind forward, because the 72-hour confirm
   window and quest expiry are states you otherwise have to take on trust. */
var CONFIRM_WINDOW_MS = 72 * 60 * 60 * 1000;
var HOUR_MS = 60 * 60 * 1000;

function ms(iso) {
  return iso ? Date.parse(iso) : null;
}
function isoAt(t) {
  return new Date(t).toISOString();
}
/* Taipei is UTC+8 year round — no DST to model. */
var TPE_OFFSET_MS = 8 * HOUR_MS;
function tpeParts(t) {
  var d = new Date(t + TPE_OFFSET_MS);
  return {
    y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(),
    hh: d.getUTCHours(), mm: d.getUTCMinutes(), wd: d.getUTCDay()
  };
}
function sameTpeDay(a, b) {
  var p = tpeParts(a), q = tpeParts(b);
  return p.y === q.y && p.m === q.m && p.d === q.d;
}
var WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* "Today, 6pm" — plain words, per the content rules. */
function clockLabel(p) {
  var ap = p.hh >= 12 ? "pm" : "am";
  var h12 = p.hh % 12 === 0 ? 12 : p.hh % 12;
  return h12 + (p.mm ? ":" + String(p.mm).padStart(2, "0") : "") + ap;
}
function formatWhenAt(iso, now) {
  if (!iso) return "";
  var t = ms(iso);
  var p = tpeParts(t);
  var time = clockLabel(p);
  if (sameTpeDay(t, now)) return "Today, " + time;
  if (sameTpeDay(t, now + 24 * HOUR_MS)) return "Tomorrow, " + time;
  if (sameTpeDay(t, now - 24 * HOUR_MS)) return "Yesterday, " + time;
  if (t > now && t - now < 7 * 24 * HOUR_MS) return WEEKDAYS[p.wd] + ", " + time;
  return p.d + " " + MONTHS[p.m] + ", " + time;
}
/* Message and ledger stamps: a bare clock time today, a date before that. */
function formatStamp(iso, now) {
  if (!iso) return "";
  var t = ms(iso);
  var p = tpeParts(t);
  if (sameTpeDay(t, now)) return clockLabel(p);
  if (sameTpeDay(t, now - 24 * HOUR_MS)) return "Yesterday";
  return p.d + " " + MONTHS[p.m];
}
/* Countdowns are coarse on purpose — a live second hand on a 72-hour window
   is drama, not information. */
function formatRemaining(untilIso, now) {
  var left = ms(untilIso) - now;
  if (left <= 0) return null;
  if (left < HOUR_MS) return Math.max(1, Math.round(left / 60000)) + " min";
  if (left < 48 * HOUR_MS) return Math.round(left / HOUR_MS) + " hr";
  return Math.round(left / (24 * HOUR_MS)) + " days";
}
function confirmDeadline(quest) {
  return quest.completedAt ? isoAt(ms(quest.completedAt) + CONFIRM_WINDOW_MS) : null;
}

/* ---------------- Geography ----------------
   Straight-line metres on the flat grid the fixture uses. Coarse by the time
   it reaches a screen (formatDistance), never rounded in our favour. */
function distanceBetween(a, b) {
  if (!a || !b) return 0;
  var dx = a.x - b.x, dy = a.y - b.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

/* ---------------- Lifecycle ---------------- */

var STATUS_META = {
  open: { label: "Open", tone: "neutral", track: -1 },
  assigned: { label: "Accepted", tone: "accent", track: 0 },
  in_progress: { label: "Doing", tone: "accent", track: 1 },
  completed: { label: "Waiting to confirm", tone: "warning", track: 1 },
  paid: { label: "Paid", tone: "success", track: 2 },
  cancelled: { label: "Cancelled", tone: "danger", track: -1 },
  expired: { label: "Expired", tone: "neutral", track: -1 },
  disputed: { label: "Disputed", tone: "danger", track: 1 }
};
function statusMeta(s) {
  return STATUS_META[s] || STATUS_META.open;
}
/* A finished quest is one nothing more will happen to. Threads on these are
   read-only (PRD §7.5) and they drop out of the active lists. */
function isClosed(s) {
  return s === "paid" || s === "cancelled" || s === "expired";
}

/* PRD §8, one row per legal edge. `actor` is the viewer's relationship to the
   quest, so an illegal transition is both unreachable in the UI and refused
   by the store if something reaches for it anyway. */
var TRANSITIONS = [
  { from: "open", to: "assigned", actor: ["poster"] },
  { from: "open", to: "cancelled", actor: ["poster"] },
  { from: "open", to: "expired", actor: ["system"] },
  { from: "assigned", to: "in_progress", actor: ["doer"] },
  { from: "assigned", to: "cancelled", actor: ["poster", "doer"], reason: true },
  { from: "in_progress", to: "completed", actor: ["doer"] },
  { from: "in_progress", to: "cancelled", actor: ["poster", "doer"], reason: true },
  { from: "completed", to: "paid", actor: ["poster", "system"] },
  { from: "completed", to: "disputed", actor: ["poster"], reason: true },
  { from: "disputed", to: "paid", actor: ["admin"] },
  { from: "disputed", to: "cancelled", actor: ["admin"] }
];
function canTransition(from, to, role) {
  for (var i = 0; i < TRANSITIONS.length; i++) {
    var t = TRANSITIONS[i];
    if (t.from === from && t.to === to && t.actor.indexOf(role) > -1) return t;
  }
  return null;
}

/* ---------------- Selectors ---------------- */

function questById(state, id) {
  for (var i = 0; i < state.quests.length; i++) if (state.quests[i].id === id) return state.quests[i];
  return null;
}
function offersFor(state, questId) {
  return state.offers.filter(function (o) { return o.questId === questId; });
}
function pendingOffersFor(state, questId) {
  return offersFor(state, questId).filter(function (o) { return o.status === "pending"; });
}
function acceptedOfferFor(state, quest) {
  if (!quest || !quest.acceptedOfferId) return null;
  for (var i = 0; i < state.offers.length; i++) if (state.offers[i].id === quest.acceptedOfferId) return state.offers[i];
  return null;
}
function myOfferOn(state, questId, userId) {
  var list = offersFor(state, questId).filter(function (o) {
    return o.doerId === userId && (o.status === "pending" || o.status === "accepted");
  });
  return list.length ? list[0] : null;
}
/* "poster" | "doer" | "applicant" | "visitor" — how the viewer relates to a
   quest. Every guard and every screen reads this, never an id comparison. */
function roleOn(state, quest, userId) {
  if (!quest) return "visitor";
  if (quest.posterId === userId) return "poster";
  var acc = acceptedOfferFor(state, quest);
  if (acc && acc.doerId === userId) return "doer";
  if (myOfferOn(state, quest.id, userId)) return "applicant";
  return "visitor";
}
function counterpartOf(state, quest, userId) {
  var role = roleOn(state, quest, userId);
  if (role === "poster") {
    var acc = acceptedOfferFor(state, quest);
    return acc ? userOf(acc.doerId) : null;
  }
  return userOf(quest.posterId);
}
/* The address is the trust mechanic, so the gate is a function, not a flag:
   revealed to the accepted doer once the quest is assigned, and to its poster
   always. Nobody else, in any state. */
function addressVisibleTo(state, quest, userId) {
  if (quest.posterId === userId) return true;
  var acc = acceptedOfferFor(state, quest);
  if (!acc || acc.doerId !== userId) return false;
  return quest.status !== "open";
}
function threadFor(state, questId, doerId) {
  for (var i = 0; i < state.threads.length; i++) {
    var t = state.threads[i];
    if (t.questId === questId && t.doerId === doerId) return t;
  }
  return null;
}
function threadsFor(state, userId) {
  return state.threads.filter(function (t) {
    return t.posterId === userId || t.doerId === userId;
  }).slice().sort(function (a, b) {
    return ms(b.lastMessageAt) - ms(a.lastMessageAt);
  });
}
function otherSideOf(thread, userId) {
  return userOf(thread.posterId === userId ? thread.doerId : thread.posterId);
}
function unreadIn(state, thread, userId) {
  var msgs = state.messages[thread.id] || [];
  var seen = state.readAt[userId + ":" + thread.id] || 0;
  return msgs.filter(function (m) {
    return m.senderId !== userId && ms(m.at) > seen;
  }).length;
}
function totalUnread(state, userId) {
  return threadsFor(state, userId).reduce(function (n, t) {
    return n + unreadIn(state, t, userId);
  }, 0);
}
/* Every quest the viewer is involved in, whichever side they are on. */
function engagementsFor(state, userId) {
  return state.quests.filter(function (q) {
    return roleOn(state, q, userId) !== "visitor";
  }).slice().sort(function (a, b) {
    return ms(b.createdAt) - ms(a.createdAt);
  });
}
function savedFor(state, userId) {
  return state.saved[userId] || [];
}
function notificationsFor(state, userId) {
  return state.notifications.filter(function (n) { return n.userId === userId; })
    .slice().sort(function (a, b) { return ms(b.at) - ms(a.at); });
}
function unreadNotifications(state, userId) {
  return notificationsFor(state, userId).filter(function (n) { return !n.readAt; }).length;
}
function reviewsOf(state, userId) {
  return state.reviews.filter(function (r) { return r.rateeId === userId; });
}
function myReviewOn(state, questId, raterId) {
  for (var i = 0; i < state.reviews.length; i++) {
    var r = state.reviews[i];
    if (r.questId === questId && r.raterId === raterId) return r;
  }
  return null;
}
/* PRD §7.8: a review shows once both sides have submitted, or after 14 days. */
var REVIEW_REVEAL_MS = 14 * 24 * HOUR_MS;
function reviewVisible(state, review, now) {
  var quest = questById(state, review.questId);
  if (!quest) return true;
  var both = myReviewOn(state, review.questId, review.rateeId);
  return !!both || now - ms(review.at) >= REVIEW_REVEAL_MS;
}

/* ---------------- Ledger ----------------
   Append-only, double-entry. Balances are derived by summation and never
   stored (ADR-005). `platform_escrow` is the provider-side mirror and stays
   empty until a real PaymentsPort exists — writing it here would double-count
   `user_held`. */
function balanceOf(ledger, account, userId) {
  return ledger.reduce(function (sum, e) {
    return e.account === account && e.userId === userId ? sum + e.amountMinor : sum;
  }, 0);
}
function availableOf(state, userId) {
  return balanceOf(state.ledger, "user_available", userId);
}
/* What the viewer has tied up. For a poster that is their own escrow; for a
   doer it is what will land when the quests they are on are confirmed. */
function heldByPoster(state, userId) {
  return balanceOf(state.ledger, "user_held", userId);
}
function incomingFor(state, userId) {
  return state.quests.reduce(function (sum, q) {
    if (isClosed(q.status) || q.status === "open") return sum;
    var acc = acceptedOfferFor(state, q);
    if (!acc || acc.doerId !== userId) return sum;
    return sum + netOf(acc.amountMinor);
  }, 0);
}
var TXN_SEQ = { n: 0 };
function txnId(prefix) {
  TXN_SEQ.n += 1;
  return prefix + "-" + TXN_SEQ.n;
}
/* The invariant is checked where entries are written, not only in a test —
   a transaction that does not balance never reaches the ledger. */
function postTxn(ledger, id, at, entries) {
  var sum = entries.reduce(function (s, e) { return s + e.amountMinor; }, 0);
  if (sum !== 0) {
    if (typeof console !== "undefined") console.error("YouDO ledger: " + id + " does not sum to zero (" + sum + ")");
    return ledger;
  }
  var stamped = entries.map(function (e, i) {
    return {
      id: id + "-" + (i + 1), txnId: id, account: e.account,
      userId: e.userId || null, questId: e.questId || null,
      amountMinor: e.amountMinor, at: at, memo: e.memo
    };
  });
  return ledger.concat(stamped);
}

/* ---------------- Discovery state ---------------- */

var DEFAULT_FILTERS = {
  radiusM: 5000,
  minPayMinor: 0,
  verifiedOnly: false,
  todayOnly: false
};
var SORTS = [
  { value: "closest", label: "Closest first" },
  { value: "pay", label: "Best paid" },
  { value: "ending", label: "Ending soonest" },
  { value: "newest", label: "Newest" }
];
function sortLabel(v) {
  for (var i = 0; i < SORTS.length; i++) if (SORTS[i].value === v) return SORTS[i].label;
  return v;
}

/* ---------------- The store ----------------
   One object holds every table, so a transition that touches four of them at
   once (accept an offer: quest, offers, ledger, notifications) is a single
   atomic write rather than four races. */

var SEQ = { n: 0 };
function nextId(prefix) {
  SEQ.n += 1;
  return prefix + "-" + SEQ.n;
}
function initialState() {
  return {
    now: ms(D.now),
    quests: D.quests,
    offers: D.offers,
    threads: D.threads,
    messages: D.messagesByThread,
    ledger: D.ledger,
    reviews: D.reviews,
    notifications: D.notifications,
    saved: D.savedByUser,
    readAt: (function () {
      var out = {};
      var src = D.threadReadAt || {};
      Object.keys(src).forEach(function (k) { out[k] = ms(src[k]); });
      return out;
    })()
  };
}
function replaceIn(list, id, patch) {
  return list.map(function (x) { return x.id === id ? Object.assign({}, x, patch) : x; });
}
function notifyInto(s, userId, type, questId, body) {
  return s.notifications.concat([{
    id: nextId("n"), userId: userId, type: type, questId: questId,
    body: body, at: isoAt(s.now), readAt: null
  }]);
}

/* System transitions. Pure, applied whenever the clock moves: quests reach
   their expiry and confirm windows run out whether or not anyone is looking,
   which is the whole point of the 72-hour rule (PRD §7.6). */
function runClock(s) {
  var now = s.now;
  var quests = s.quests;
  var offers = s.offers;
  var ledger = s.ledger;
  var notes = s.notifications;
  var changed = false;

  quests = quests.map(function (q) {
    if (q.status === "open" && q.expiresAt && ms(q.expiresAt) <= now) {
      changed = true;
      offers = offers.map(function (o) {
        return o.questId === q.id && o.status === "pending"
          ? Object.assign({}, o, { status: "expired", respondedAt: isoAt(now) })
          : o;
      });
      notes = notes.concat([{
        id: nextId("n"), userId: q.posterId, type: "quest_expired", questId: q.id,
        body: "“" + q.title + "” expired before anyone took it", at: isoAt(now), readAt: null
      }]);
      return Object.assign({}, q, { status: "expired" });
    }
    if (q.status === "completed" && q.completedAt && ms(q.completedAt) + CONFIRM_WINDOW_MS <= now) {
      var acc = null;
      for (var i = 0; i < offers.length; i++) if (offers[i].id === q.acceptedOfferId) acc = offers[i];
      if (!acc) return q;
      changed = true;
      var gross = acc.amountMinor, fee = feeOn(gross), net = gross - fee;
      var tx = txnId("tx-auto");
      ledger = postTxn(ledger, tx, isoAt(now), [
        { account: "user_held", userId: q.posterId, questId: q.id, amountMinor: -gross, memo: "Released to the doer" },
        { account: "user_available", userId: acc.doerId, questId: q.id, amountMinor: net, memo: "Quest paid" },
        { account: "platform_fee", userId: null, questId: q.id, amountMinor: fee, memo: "Platform fee" }
      ]);
      notes = notes.concat([{
        id: nextId("n"), userId: acc.doerId, type: "payment", questId: q.id,
        body: formatMoney(net) + " released automatically — the confirm window closed on “" + q.title + "”",
        at: isoAt(now), readAt: null
      }, {
        id: nextId("n"), userId: q.posterId, type: "payment", questId: q.id,
        body: "The 72-hour window closed, so “" + q.title + "” paid out automatically",
        at: isoAt(now), readAt: null
      }]);
      return Object.assign({}, q, { status: "paid", paidAt: isoAt(now) });
    }
    return q;
  });

  if (!changed) return s;
  return Object.assign({}, s, { quests: quests, offers: offers, ledger: ledger, notifications: notes });
}

function useApp() {
  var st = React.useState(initialState);
  var state = st[0], setState = st[1];
  var ac = React.useState(D.meId);
  var actorId = ac[0], setActorId = ac[1];
  var fl = React.useState(DEFAULT_FILTERS);
  var filters = fl[0], setFilters = fl[1];
  var so = React.useState("closest");
  var sort = so[0], setSort = so[1];
  var ts = React.useState(null);
  var toast = ts[0], setToast = ts[1];
  var timer = React.useRef(null);

  function flash(tone, text) {
    setToast({ tone: tone, text: text, key: Date.now() });
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(function () { setToast(null); }, 3600);
  }
  React.useEffect(function () {
    return function () { if (timer.current) window.clearTimeout(timer.current); };
  }, []);

  var app = {
    state: state, actorId: actorId, now: state.now,
    filters: filters, setFilters: setFilters,
    sort: sort, setSort: setSort,
    toast: toast, flash: flash
  };

  /* ---- identity ---- */
  app.me = function () { return userOf(actorId); };
  app.switchActor = function (id) {
    setActorId(id);
    flash("neutral", "Now viewing as " + userOf(id).name);
  };
  /* Same change of chair, without the announcement — the scripted flows move
     between the two sides constantly and a toast per hop is noise. */
  app.setActor = setActorId;

  /* ---- clock ---- */
  app.advanceClock = function (delta, label) {
    setState(function (s) { return runClock(Object.assign({}, s, { now: s.now + delta })); });
    flash("neutral", "Clock moved " + label + " — expiry and auto-release caught up");
  };

  /* ---- discovery ---- */
  app.distanceTo = function (quest) {
    return distanceBetween(userOf(actorId).home, quest.point);
  };
  app.toggleSave = function (questId) {
    var on = savedFor(state, actorId).indexOf(questId) > -1;
    setState(function (s) {
      var list = s.saved[actorId] || [];
      var next = Object.assign({}, s.saved);
      next[actorId] = on ? list.filter(function (x) { return x !== questId; }) : list.concat([questId]);
      return Object.assign({}, s, { saved: next });
    });
    flash("neutral", on ? "Removed from saved" : "Saved — it's on your profile");
  };

  /* ---- offers ---- */
  app.sendOffer = function (quest, amountMinor, note) {
    if (quest.posterId === actorId) { flash("danger", "This is your own quest — you can't offer on it"); return; }
    if (quest.status !== "open") { flash("danger", "This quest isn't taking offers any more"); return; }
    if (myOfferOn(state, quest.id, actorId)) { flash("danger", "You already have an offer on this quest"); return; }
    if (amountMinor <= 0) { flash("danger", "Name a price above zero"); return; }
    var doer = userOf(actorId);
    setState(function (s) {
      var offer = {
        id: nextId("o"), questId: quest.id, doerId: actorId, amountMinor: amountMinor,
        note: note && note.trim() ? note.trim() : "", status: "pending",
        createdAt: isoAt(s.now), respondedAt: null
      };
      var tid = "t-" + quest.id + "-" + actorId;
      var threads = s.threads, messages = s.messages;
      if (!threadFor(s, quest.id, actorId)) {
        threads = [{ id: tid, questId: quest.id, posterId: quest.posterId, doerId: actorId, lastMessageAt: isoAt(s.now) }].concat(threads);
        messages = Object.assign({}, messages);
        messages[tid] = [{
          id: nextId("m"), senderId: actorId,
          body: offer.note || "I'd like to take this on at " + formatMoney(amountMinor) + ".",
          at: isoAt(s.now)
        }];
      }
      return Object.assign({}, s, {
        offers: s.offers.concat([offer]),
        threads: threads, messages: messages,
        notifications: notifyInto(s, quest.posterId, "offer_received", quest.id,
          doer.name + " offered " + formatMoney(amountMinor) + " on “" + quest.title + "”")
      });
    });
    flash("success", "Offer sent to " + userOf(quest.posterId).name);
  };

  app.withdrawOffer = function (offer) {
    if (offer.doerId !== actorId || offer.status !== "pending") { flash("danger", "That offer can't be withdrawn"); return; }
    setState(function (s) {
      return Object.assign({}, s, {
        offers: replaceIn(s.offers, offer.id, { status: "withdrawn", respondedAt: isoAt(s.now) })
      });
    });
    flash("neutral", "Offer withdrawn — you can send another while the quest is open");
  };

  app.declineOffer = function (offer) {
    var quest = questById(state, offer.questId);
    if (!quest || quest.posterId !== actorId || offer.status !== "pending") { flash("danger", "That offer isn't yours to decline"); return; }
    setState(function (s) {
      return Object.assign({}, s, {
        offers: replaceIn(s.offers, offer.id, { status: "declined", respondedAt: isoAt(s.now) }),
        notifications: notifyInto(s, offer.doerId, "offer_declined", quest.id,
          "Your offer on “" + quest.title + "” wasn't taken this time")
      });
    });
    flash("neutral", "Declined — " + userOf(offer.doerId).name + " has been told");
  };

  /* The transition that makes the marketplace a marketplace: escrow is created
     here and nowhere else, and it is what reveals the address. */
  app.acceptOffer = function (offer) {
    var quest = questById(state, offer.questId);
    if (!quest) return;
    var role = roleOn(state, quest, actorId);
    if (!canTransition(quest.status, "assigned", role)) { flash("danger", "This quest can't be assigned from " + statusMeta(quest.status).label.toLowerCase()); return; }
    if (offer.status !== "pending") { flash("danger", "That offer is no longer pending"); return; }
    if (availableOf(state, actorId) < offer.amountMinor) {
      flash("danger", "You need " + formatMoney(offer.amountMinor - availableOf(state, actorId)) + " more in your wallet to hold this");
      return;
    }
    var doer = userOf(offer.doerId);
    setState(function (s) {
      var others = pendingOffersFor(s, quest.id).filter(function (o) { return o.id !== offer.id; });
      var offers = s.offers.map(function (o) {
        if (o.id === offer.id) return Object.assign({}, o, { status: "accepted", respondedAt: isoAt(s.now) });
        if (o.questId === quest.id && o.status === "pending") return Object.assign({}, o, { status: "declined", respondedAt: isoAt(s.now) });
        return o;
      });
      var tx = txnId("tx-hold");
      var ledger = postTxn(s.ledger, tx, isoAt(s.now), [
        { account: "user_available", userId: actorId, questId: quest.id, amountMinor: -offer.amountMinor, memo: "Held for a quest" },
        { account: "user_held", userId: actorId, questId: quest.id, amountMinor: offer.amountMinor, memo: "Held for a quest" }
      ]);
      var notes = notifyInto(s, offer.doerId, "offer_accepted", quest.id,
        "Your offer on “" + quest.title + "” was accepted — the address is now in the thread");
      others.forEach(function (o) {
        notes = notes.concat([{
          id: nextId("n"), userId: o.doerId, type: "offer_declined", questId: quest.id,
          body: "“" + quest.title + "” went to someone else", at: isoAt(s.now), readAt: null
        }]);
      });
      return Object.assign({}, s, {
        quests: replaceIn(s.quests, quest.id, { status: "assigned", acceptedOfferId: offer.id, assignedAt: isoAt(s.now) }),
        offers: offers, ledger: ledger, notifications: notes
      });
    });
    flash("money", formatMoney(offer.amountMinor) + " held — " + doer.name + " can see the address now");
  };

  /* ---- lifecycle ---- */
  function guard(quest, to) {
    var role = roleOn(state, quest, actorId);
    var t = canTransition(quest.status, to, role);
    if (!t) {
      flash("danger", role === "visitor"
        ? "You're not on this quest"
        : "A " + role + " can't move this from " + statusMeta(quest.status).label.toLowerCase());
      return null;
    }
    return t;
  }

  app.startQuest = function (quest) {
    if (!guard(quest, "in_progress")) return;
    setState(function (s) {
      return Object.assign({}, s, {
        quests: replaceIn(s.quests, quest.id, { status: "in_progress", startedAt: isoAt(s.now) }),
        notifications: notifyInto(s, quest.posterId, "quest_started", quest.id,
          userOf(actorId).name + " started “" + quest.title + "”")
      });
    });
    flash("success", "Started — " + userOf(quest.posterId).name + " has been told");
  };

  app.markDone = function (quest) {
    if (!guard(quest, "completed")) return;
    setState(function (s) {
      return Object.assign({}, s, {
        quests: replaceIn(s.quests, quest.id, { status: "completed", completedAt: isoAt(s.now) }),
        notifications: notifyInto(s, quest.posterId, "quest_done", quest.id,
          userOf(actorId).name + " marked “" + quest.title + "” as done — 72 hours to confirm")
      });
    });
    flash("success", "Marked as done — payment releases in 72 hours if nothing is raised");
  };

  app.confirmDone = function (quest) {
    if (!guard(quest, "paid")) return;
    var acc = acceptedOfferFor(state, quest);
    if (!acc) { flash("danger", "This quest has no accepted offer to pay"); return; }
    var gross = acc.amountMinor, fee = feeOn(gross), net = gross - fee;
    setState(function (s) {
      var tx = txnId("tx-release");
      var ledger = postTxn(s.ledger, tx, isoAt(s.now), [
        { account: "user_held", userId: quest.posterId, questId: quest.id, amountMinor: -gross, memo: "Released to the doer" },
        { account: "user_available", userId: acc.doerId, questId: quest.id, amountMinor: net, memo: "Quest paid" },
        { account: "platform_fee", userId: null, questId: quest.id, amountMinor: fee, memo: "Platform fee" }
      ]);
      return Object.assign({}, s, {
        quests: replaceIn(s.quests, quest.id, { status: "paid", paidAt: isoAt(s.now) }),
        ledger: ledger,
        notifications: notifyInto(s, acc.doerId, "payment", quest.id,
          formatMoney(net) + " released to your wallet for “" + quest.title + "”")
      });
    });
    flash("money", formatMoney(net) + " released to " + userOf(acc.doerId).name);
  };

  app.cancelQuest = function (quest, reason) {
    if (!guard(quest, "cancelled")) return;
    if (quest.status !== "open" && !(reason && reason.trim())) { flash("danger", "Say why, so the other side knows what happened"); return; }
    var acc = acceptedOfferFor(state, quest);
    var counterpart = counterpartOf(state, quest, actorId);
    setState(function (s) {
      var ledger = s.ledger;
      var offers = s.offers;
      if (acc) {
        var tx = txnId("tx-refund");
        ledger = postTxn(ledger, tx, isoAt(s.now), [
          { account: "user_held", userId: quest.posterId, questId: quest.id, amountMinor: -acc.amountMinor, memo: "Refunded after cancellation" },
          { account: "user_available", userId: quest.posterId, questId: quest.id, amountMinor: acc.amountMinor, memo: "Refunded after cancellation" }
        ]);
      } else {
        /* An open quest cancelled by its poster withdraws the offers waiting on it. */
        offers = offers.map(function (o) {
          return o.questId === quest.id && o.status === "pending"
            ? Object.assign({}, o, { status: "withdrawn", respondedAt: isoAt(s.now) })
            : o;
        });
      }
      var notes = s.notifications;
      if (counterpart) {
        notes = notifyInto(s, counterpart.id, "quest_cancelled", quest.id,
          "“" + quest.title + "” was cancelled by " + userOf(actorId).name +
          (reason && reason.trim() ? " — " + reason.trim() : ""));
      }
      return Object.assign({}, s, {
        quests: replaceIn(s.quests, quest.id, {
          status: "cancelled", cancelledAt: isoAt(s.now), cancelledBy: actorId,
          cancelReason: reason && reason.trim() ? reason.trim() : null
        }),
        offers: offers, ledger: ledger, notifications: notes
      });
    });
    flash(acc ? "money" : "neutral", acc
      ? "Cancelled — " + formatMoney(acc.amountMinor) + " refunded to " + (quest.posterId === actorId ? "your wallet" : userOf(quest.posterId).name)
      : "Cancelled — the offers waiting on it have been withdrawn");
  };

  app.disputeQuest = function (quest, reason) {
    if (!guard(quest, "disputed")) return;
    if (!(reason && reason.trim())) { flash("danger", "Describe what went wrong so someone can look at it"); return; }
    var acc = acceptedOfferFor(state, quest);
    setState(function (s) {
      var notes = s.notifications;
      if (acc) {
        notes = notifyInto(s, acc.doerId, "quest_disputed", quest.id,
          "“" + quest.title + "” was raised for review — the payment is on hold until someone looks at it");
      }
      return Object.assign({}, s, {
        quests: replaceIn(s.quests, quest.id, {
          status: "disputed", disputedAt: isoAt(s.now), disputeReason: reason.trim()
        }),
        notifications: notes
      });
    });
    flash("neutral", "Raised for review — the money stays held while we look");
  };

  /* ---- posting ---- */
  app.postQuest = function (form) {
    var id = nextId("q");
    setState(function (s) {
      var quest = {
        id: id, posterId: actorId, title: form.title, details: form.details || "",
        payoutMinor: form.payoutMinor, payoutUnit: form.payoutUnit || "fixed",
        categoryId: form.categoryId, estimatedMinutes: form.estimatedMinutes || 60,
        point: form.point, area: form.area, addressLine: form.addressLine,
        scheduledFor: form.scheduledFor, expiresAt: form.expiresAt,
        createdAt: isoAt(s.now), status: "open", acceptedOfferId: null,
        requirements: form.requirements || []
      };
      return Object.assign({}, s, { quests: [quest].concat(s.quests) });
    });
    flash("success", "Quest posted — doers nearby can see it now");
    return id;
  };

  /* ---- messaging ---- */
  app.sendMessage = function (thread, body) {
    if (!body.trim()) return;
    var quest = questById(state, thread.questId);
    if (quest && isClosed(quest.status)) { flash("danger", "This thread is closed — the quest is " + statusMeta(quest.status).label.toLowerCase()); return; }
    var other = otherSideOf(thread, actorId);
    setState(function (s) {
      var msgs = Object.assign({}, s.messages);
      msgs[thread.id] = (msgs[thread.id] || []).concat([{
        id: nextId("m"), senderId: actorId, body: body.trim(), at: isoAt(s.now)
      }]);
      return Object.assign({}, s, {
        messages: msgs,
        threads: replaceIn(s.threads, thread.id, { lastMessageAt: isoAt(s.now) }),
        notifications: notifyInto(s, other.id, "message", thread.questId,
          userOf(actorId).name + " sent you a message")
      });
    });
  };
  app.markThreadRead = function (thread) {
    setState(function (s) {
      var next = Object.assign({}, s.readAt);
      next[actorId + ":" + thread.id] = s.now;
      return Object.assign({}, s, { readAt: next });
    });
  };

  /* ---- ratings ---- */
  app.submitReview = function (quest, rating, comment) {
    if (quest.status !== "paid") { flash("danger", "Ratings open once the quest is paid"); return; }
    var role = roleOn(state, quest, actorId);
    if (role !== "poster" && role !== "doer") { flash("danger", "Only the two people on a quest can rate it"); return; }
    if (myReviewOn(state, quest.id, actorId)) { flash("danger", "You've already rated this one"); return; }
    var other = counterpartOf(state, quest, actorId);
    if (!other) return;
    setState(function (s) {
      return Object.assign({}, s, {
        reviews: s.reviews.concat([{
          id: nextId("r"), questId: quest.id, raterId: actorId, rateeId: other.id,
          rating: rating, comment: comment && comment.trim() ? comment.trim() : "", at: isoAt(s.now)
        }])
      });
    });
    flash("success", "Rated — " + other.name + " sees it once they rate you back");
  };

  /* ---- wallet ---- */
  app.cashOut = function (minor) {
    if (minor <= 0 || minor > availableOf(state, actorId)) { flash("danger", "Cash out an amount you have available"); return; }
    setState(function (s) {
      var tx = txnId("tx-cash");
      return Object.assign({}, s, {
        ledger: postTxn(s.ledger, tx, isoAt(s.now), [
          { account: "user_available", userId: actorId, questId: null, amountMinor: -minor, memo: "Cash out to " + userOf(actorId).bank },
          { account: "external_bank", userId: actorId, questId: null, amountMinor: minor, memo: "Cash out to " + userOf(actorId).bank }
        ])
      });
    });
    flash("money", formatMoney(minor) + " is on its way to your bank");
  };

  /* ---- notifications ---- */
  app.readAllNotifications = function () {
    setState(function (s) {
      return Object.assign({}, s, {
        notifications: s.notifications.map(function (n) {
          return n.userId === actorId && !n.readAt ? Object.assign({}, n, { readAt: isoAt(s.now) }) : n;
        })
      });
    });
  };

  /* Convenience reads, so screens never reach past the store into raw tables. */
  app.available = availableOf(state, actorId);
  app.held = heldByPoster(state, actorId);
  app.incoming = incomingFor(state, actorId);
  app.unread = totalUnread(state, actorId);
  app.unreadNotes = unreadNotifications(state, actorId);
  return app;
}

/* ---------------- Lifecycle UI parts ----------------
   Small pieces shared by the detail screen, the quest list and the thread, so
   a status reads identically wherever it appears. Both sides of a quest see
   the same words for the same state — PRD §7.6. */

/* The 12px meta eyebrow and Badge are the only places the system allows
   uppercase; everything else is sentence case. */
function Eyebrow(props) {
  return h("span", { style: Object.assign({}, SECTION_LABEL, props.style) }, props.children);
}

function StatusBadge(props) {
  var m = statusMeta(props.status);
  return h(Badge, { tone: m.tone, size: props.size || "sm" }, m.label);
}

/* A plain key/value line inside a card. */
function InfoRow(props) {
  return h("div", {
    style: {
      display: "flex", alignItems: "center", gap: 10, padding: "9px 0",
      borderBottom: props.last ? "none" : "var(--border-hair) solid var(--border-subtle)"
    }
  },
    props.icon ? h(Icon, { name: props.icon, size: 16, color: "var(--ink-500)" }) : null,
    h("span", { style: { flex: 1, fontSize: "var(--text-sm)", color: "var(--text-secondary)" } }, props.label),
    h("span", {
      style: {
        fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)",
        textAlign: "right", color: props.tone === "danger" ? "var(--danger-600)" : undefined
      }
    }, props.value));
}

/* Fee disclosure. PRD §4.5 — shown before commitment, never after, and it
   always names the rate and both sides of the split. */
function FeeBreakdown(props) {
  var gross = props.amountMinor;
  var fee = feeOn(gross);
  return h(Card, { variant: "sunken", padding: "md" },
    h(Eyebrow, null, props.title || "Before you commit"),
    h(InfoRow, { label: "Quest price", value: formatMoney(gross) }),
    h(InfoRow, { label: "Platform fee (" + feeRateLabel() + ")", value: "−" + formatMoney(fee) }),
    h(InfoRow, {
      label: props.doerSide ? "You receive" : "The doer receives",
      value: formatMoney(gross - fee), last: true
    }),
    h("p", {
      style: {
        margin: "8px 0 0", fontSize: "var(--text-2xs)",
        lineHeight: "var(--leading-normal)", color: "var(--text-secondary)"
      }
    }, props.note || ("We hold " + formatMoney(gross) + " the moment you accept. It reaches the doer when you confirm the quest is done, and comes back to you in full if it's cancelled.")));
}

/* The confirm window. A countdown that says what happens when it ends, rather
   than a bare timer — an unconfirmed quest pays out, it does not lapse. */
function ConfirmWindow(props) {
  var left = formatRemaining(confirmDeadline(props.quest), props.now);
  return h(Card, { variant: "money", padding: "md" },
    h("div", { style: { display: "flex", alignItems: "flex-start", gap: 10 } },
      h(Icon, { name: "clock", size: 18, strokeWidth: 2, style: { marginTop: 1 } }),
      h("div", { style: { flex: 1, minWidth: 0 } },
        h("div", { style: { fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)" } },
          left ? left + " left to confirm" : "The confirm window has closed"),
        h("div", {
          style: { fontSize: "var(--text-2xs)", marginTop: 2, lineHeight: "var(--leading-normal)" }
        }, props.doerSide
          ? (left ? "If nothing is raised, the payment releases to you automatically." : "Payment released automatically.")
          : (left ? "After that the payment releases automatically, so nobody is left waiting." : "Payment released automatically.")))));
}

/* Cancellation is a normal event with a clear path and a visible record —
   PRD §4.4 — so it gets a proper sheet, not a destructive confirm. */
var CANCEL_REASONS = [
  "My plans changed",
  "I can't make the time any more",
  "We agreed to call it off",
  "The other person stopped replying",
  "Something else"
];
function CancelSheet(props) {
  var r = React.useState(CANCEL_REASONS[0]);
  var reason = r[0], setReason = r[1];
  var o = React.useState("");
  var other = o[0], setOther = o[1];
  var quest = props.quest;
  var acc = props.acceptedOffer;
  var text = reason === "Something else" ? other : reason;
  React.useEffect(function () {
    if (props.open) { setReason(CANCEL_REASONS[0]); setOther(""); }
  }, [props.open]);
  return h(Dialog, {
    open: props.open, onClose: props.onClose,
    title: "Cancel this quest",
    subtitle: acc ? "The other side is told, and the money goes straight back" : "Anyone who offered will be told",
    actions: h(Fragment, null,
      h(Button, { variant: "ghost", onClick: props.onClose }, "Keep it"),
      h(Button, {
        variant: "danger", fullWidth: true, disabled: !text.trim(),
        onClick: function () { props.onConfirm(text); }
      }, "Cancel quest"))
  },
    acc ? h(Card, { variant: "sunken", padding: "md" },
      h(InfoRow, { icon: "coins", label: "Refunded in full", value: formatMoney(acc.amountMinor), last: true })) : null,
    h(Eyebrow, null, "Why are you cancelling?"),
    CANCEL_REASONS.map(function (x) {
      return h(Radio, {
        key: x, name: "cancel-reason", label: x,
        checked: reason === x, onChange: function () { setReason(x); }
      });
    }),
    reason === "Something else" ? h(Input, {
      label: "Tell them what happened", multiline: true, rows: 2, value: other,
      onChange: function (ev) { setOther(ev.target.value); },
      placeholder: "A short line is enough."
    }) : null,
    h("p", {
      style: {
        margin: 0, fontSize: "var(--text-2xs)", color: "var(--text-secondary)",
        lineHeight: "var(--leading-normal)"
      }
    }, "Cancelling after you've been matched counts towards the cancellation rate on your profile."));
}

function DisputeSheet(props) {
  var r = React.useState("");
  var reason = r[0], setReason = r[1];
  React.useEffect(function () { if (props.open) setReason(""); }, [props.open]);
  return h(Dialog, {
    open: props.open, onClose: props.onClose,
    title: "Raise an issue",
    subtitle: "The payment stays held while someone looks at it",
    actions: h(Fragment, null,
      h(Button, { variant: "ghost", onClick: props.onClose }, "Back"),
      h(Button, {
        fullWidth: true, disabled: !reason.trim(),
        onClick: function () { props.onConfirm(reason); }
      }, "Send for review"))
  },
    h(Input, {
      label: "What went wrong?", multiline: true, rows: 3, value: reason,
      onChange: function (ev) { setReason(ev.target.value); },
      placeholder: "Only half the job was done, and we couldn't agree on it in the chat.",
      hint: "The other person sees this."
    }),
    h(Card, { variant: "sunken", padding: "md" },
      h("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } },
        h(Icon, { name: "info", size: 16, color: "var(--ink-500)", style: { marginTop: 2 } }),
        h("span", {
          style: { fontSize: "var(--text-2xs)", lineHeight: "var(--leading-normal)", color: "var(--text-secondary)" }
        }, "Most things sort themselves out in the chat. Raise it here when they haven't."))));
}

/* Ratings capture. The kit could display a rating; nothing could leave one. */
function StarPicker(props) {
  var hv = React.useState(0);
  var hover = hv[0], setHover = hv[1];
  var shown = hover || props.value;
  return h("div", { style: { display: "flex", gap: 6 }, onMouseLeave: function () { setHover(0); } },
    [1, 2, 3, 4, 5].map(function (n) {
      return h("button", {
        key: n, type: "button",
        "aria-label": n + (n === 1 ? " star" : " stars"),
        "aria-pressed": props.value === n,
        onMouseEnter: function () { setHover(n); },
        onClick: function () { props.onChange(n); },
        style: {
          width: 44, height: 44, display: "grid", placeItems: "center",
          background: n <= shown ? "var(--coin-500)" : "var(--paper-000)",
          border: "var(--border-width) solid var(--border-strong)",
          borderRadius: "var(--radius-pill)",
          boxShadow: n <= shown ? "var(--shadow-sticker-sm)" : "none",
          cursor: "pointer", padding: 0,
          transition: "var(--transition-control)"
        }
      }, h(Icon, { name: "star", size: 19, filled: n <= shown, strokeWidth: 2 }));
    }));
}
var RATING_WORDS = { 1: "Went badly", 2: "Not great", 3: "Fine", 4: "Good", 5: "Excellent" };
function RateSheet(props) {
  var rt = React.useState(0);
  var rating = rt[0], setRating = rt[1];
  var cm = React.useState("");
  var comment = cm[0], setComment = cm[1];
  React.useEffect(function () { if (props.open) { setRating(0); setComment(""); } }, [props.open]);
  var who = props.counterpart;
  return h(Dialog, {
    open: props.open, onClose: props.onClose,
    title: "How did it go?",
    subtitle: who ? "Your rating of " + who.name + " shows once they rate you back" : undefined,
    actions: h(Fragment, null,
      h(Button, { variant: "ghost", onClick: props.onClose }, "Not now"),
      h(Button, {
        fullWidth: true, disabled: rating === 0,
        onClick: function () { props.onConfirm(rating, comment); }
      }, "Leave a rating"))
  },
    who ? h(UserChip, {
      name: who.name, rating: who.rating, quests: who.questsCompleted,
      verified: who.verified, size: "lg"
    }) : null,
    h("div", { style: { display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" } },
      h(StarPicker, { value: rating, onChange: setRating }),
      h("span", {
        style: { fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", minHeight: 21 }
      }, rating ? RATING_WORDS[rating] : "Tap a star")),
    h(Input, {
      label: "Add a comment", multiline: true, rows: 2, value: comment,
      onChange: function (ev) { setComment(ev.target.value); },
      placeholder: "Turned up on time and sent a photo without being asked."
    }));
}

/* One offer, as the poster sees it in their inbox. */
function OfferRow(props) {
  var o = props.offer;
  var u = userOf(o.doerId);
  var asking = props.quest.payoutMinor;
  var delta = o.amountMinor - asking;
  return h(Card, { padding: "md" },
    h("div", { style: { display: "flex", alignItems: "flex-start", gap: 10 } },
      h(UserChip, {
        name: u.name, rating: u.rating, quests: u.questsCompleted, verified: u.verified,
        size: "md", style: { flex: 1, minWidth: 0 }
      }),
      h("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 } },
        h(RewardPill, { amount: formatMoney(o.amountMinor), unit: null, tone: delta > 0 ? "quiet" : "money" }),
        delta !== 0 ? h("span", {
          style: { fontSize: "var(--text-3xs)", fontFamily: "var(--font-mono)", color: "var(--ink-400)" } },
          (delta > 0 ? "+" : "−") + formatMoney(Math.abs(delta)).replace("NT$", "NT$") + " vs asking") : null)),
    o.note ? h("p", {
      style: {
        margin: "10px 0 0", fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)",
        color: "var(--ink-700)"
      }
    }, o.note) : null,
    h("div", { style: { display: "flex", gap: 8, alignItems: "center", marginTop: 10 } },
      h("span", { style: { flex: 1, minWidth: 0, fontSize: "var(--text-3xs)", fontFamily: "var(--font-mono)", color: "var(--ink-400)" } },
        formatStamp(o.createdAt, props.now)),
      props.onMessage ? h(Button, { size: "sm", variant: "ghost", icon: "message-circle", onClick: props.onMessage }, "Open chat") : null),
    props.onAccept || props.onDecline ? h("div", {
      style: {
        display: "flex", gap: 8, marginTop: 10, paddingTop: 10,
        borderTop: "var(--border-hair) solid var(--border-subtle)"
      }
    },
      props.onDecline ? h(Button, { size: "sm", variant: "secondary", fullWidth: true, onClick: props.onDecline }, "Decline") : null,
      props.onAccept ? h(Button, { size: "sm", variant: "primary", icon: "check", fullWidth: true, onClick: props.onAccept }, "Accept offer") : null) : null);
}

/* A read-only summary of an offer the viewer sent. */
function MyOfferPanel(props) {
  var o = props.offer;
  var TONE = { pending: "warning", accepted: "success", declined: "neutral", withdrawn: "neutral", expired: "neutral" };
  var WORD = {
    pending: "Waiting to hear back",
    accepted: "Your offer was accepted",
    declined: "This one went to someone else",
    withdrawn: "You withdrew this offer",
    expired: "The quest expired before a decision"
  };
  return h(Card, { variant: "sunken", padding: "md" },
    h("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
      h(Badge, { tone: TONE[o.status] || "neutral", size: "sm" }, o.status),
      h("span", { style: { flex: 1, fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" } }, WORD[o.status]),
      h(RewardPill, { amount: formatMoney(o.amountMinor), unit: null, tone: "quiet" })),
    o.note ? h("p", {
      style: { margin: "10px 0 0", fontSize: "var(--text-2xs)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)" }
    }, "You said: " + o.note) : null,
    props.onWithdraw && o.status === "pending" ? h(Button, {
      size: "sm", variant: "secondary", style: { marginTop: 12 }, onClick: props.onWithdraw
    }, "Withdraw offer") : null);
}

/* The closing note on a quest that ended without payment. Stated as fact,
   never as an apology. */
function ClosedNote(props) {
  var q = props.quest;
  if (q.status === "cancelled") {
    var who = q.cancelledBy ? userOf(q.cancelledBy) : null;
    return h(Card, { variant: "sunken", padding: "md" },
      h("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" } },
        h(Icon, { name: "x", size: 17, color: "var(--danger-600)", style: { marginTop: 2 } }),
        h("div", { style: { flex: 1, minWidth: 0 } },
          h("div", { style: { fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" } },
            "Cancelled by " + (who ? (who.id === props.actorId ? "you" : who.name) : "the poster")),
          q.cancelReason ? h("div", {
            style: { fontSize: "var(--text-2xs)", color: "var(--text-secondary)", marginTop: 2, lineHeight: "var(--leading-normal)" }
          }, q.cancelReason) : null,
          h("div", {
            style: { fontSize: "var(--text-2xs)", color: "var(--text-secondary)", marginTop: 4 }
          }, q.acceptedOfferId ? "The held money went back in full." : "Nothing had been held yet."))));
  }
  if (q.status === "expired") {
    return h(Card, { variant: "sunken", padding: "md" },
      h("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" } },
        h(Icon, { name: "clock", size: 17, color: "var(--ink-500)", style: { marginTop: 2 } }),
        h("div", { style: { flex: 1 } },
          h("div", { style: { fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" } }, "Expired before anyone took it"),
          h("div", {
            style: { fontSize: "var(--text-2xs)", color: "var(--text-secondary)", marginTop: 2, lineHeight: "var(--leading-normal)" }
          }, "Post it again with a longer window or a higher price and it'll get seen."))));
  }
  if (q.status === "disputed") {
    return h(Card, { padding: "md", style: { borderColor: "var(--danger-500)" } },
      h("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" } },
        h(Icon, { name: "flag", size: 17, color: "var(--danger-600)", style: { marginTop: 2 } }),
        h("div", { style: { flex: 1 } },
          h("div", { style: { fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" } }, "Raised for review"),
          q.disputeReason ? h("div", {
            style: { fontSize: "var(--text-2xs)", color: "var(--text-secondary)", marginTop: 2, lineHeight: "var(--leading-normal)" }
          }, q.disputeReason) : null,
          h("div", {
            style: { fontSize: "var(--text-2xs)", color: "var(--text-secondary)", marginTop: 4 }
          }, "The money stays held until someone has looked at it."))));
  }
  return null;
}

/* The address, and the sentence that explains why it isn't there yet. */
function AddressBlock(props) {
  var q = props.quest;
  if (props.visible) {
    return h(Card, { variant: "accent", padding: "md" },
      h("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" } },
        h(Icon, { name: "map-pin", size: 18, strokeWidth: 2, style: { marginTop: 1 } }),
        h("div", { style: { flex: 1, minWidth: 0 } },
          h(Eyebrow, { style: { color: "var(--ink-700)" } }, "Exact address"),
          h("div", {
            style: { fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", marginTop: 4, lineHeight: "var(--leading-normal)" }
          }, q.addressLine),
          h("div", { style: { fontSize: "var(--text-2xs)", marginTop: 2 } }, q.area + " · " + formatDistance(props.distanceM)))));
  }
  return h(Card, { variant: "sunken", padding: "md" },
    h("div", { style: { display: "flex", gap: 10, alignItems: "center" } },
      h(Icon, { name: "lock", size: 17, color: "var(--ink-500)" }),
      h("div", { style: { flex: 1, minWidth: 0 } },
        h("div", { style: { fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" } },
          q.area + " · " + formatDistance(props.distanceM) + " away"),
        h("div", {
          style: { fontSize: "var(--text-2xs)", color: "var(--text-secondary)", marginTop: 2, lineHeight: "var(--leading-normal)" }
        }, "The exact address is shared the moment your offer is accepted."))));
}

/* ---------------- Browse ---------------- */

/* Badges are derived, not stored. A fixture that carries "Ends in 2h" as a
   string is wrong the moment the clock moves — and the clock moves here. */
function questBadges(quest, now) {
  var out = [];
  var left = quest.expiresAt ? ms(quest.expiresAt) - now : null;
  if (left !== null && left > 0 && left <= 3 * HOUR_MS) {
    out.push({ label: "Ends in " + formatRemaining(quest.expiresAt, now), tone: "hot", icon: "clock" });
  } else if (now - ms(quest.createdAt) <= 3 * HOUR_MS) {
    out.push({ label: "New", tone: "accent" });
  }
  if ((quest.requirements || []).some(function (r) { return /drill|tools?\b/i.test(r); })) {
    out.push({ label: "Tools needed", tone: "warning", icon: "briefcase" });
  }
  return out;
}

function BrowseScreen(props) {
  var app = props.app, state = app.state;
  var st = React.useState("");
  var q = st[0], setQ = st[1];
  var ct = React.useState("all");
  var cat = ct[0], setCat = ct[1];
  var sh = React.useState(false);
  var sheet = sh[0], setSheet = sh[1];
  var dr = React.useState(null);
  var draft = dr[0], setDraft = dr[1];

  function openSheet() {
    setDraft({ filters: Object.assign({}, app.filters), sort: app.sort });
    setSheet(true);
  }
  function applySheet() {
    app.setFilters(draft.filters);
    app.setSort(draft.sort);
    setSheet(false);
  }
  function patch(k, v) {
    var o = {};
    o[k] = v;
    setDraft({ filters: Object.assign({}, draft.filters, o), sort: draft.sort });
  }

  var saved = savedFor(state, app.actorId);
  var withDistance = state.quests.filter(function (x) { return x.status === "open"; })
    .map(function (x) {
      return { quest: x, distanceM: app.distanceTo(x) };
    });

  var list = withDistance.filter(function (row) {
    var x = row.quest;
    if (cat !== "all" && x.categoryId !== cat) return false;
    if (q) {
      var hay = (x.title + " " + x.details).toLowerCase();
      if (hay.indexOf(q.toLowerCase()) < 0) return false;
    }
    if (row.distanceM > app.filters.radiusM) return false;
    if (x.payoutMinor < app.filters.minPayMinor) return false;
    if (app.filters.verifiedOnly && !userOf(x.posterId).verified) return false;
    if (app.filters.todayOnly && !sameTpeDay(ms(x.scheduledFor), app.now)) return false;
    return true;
  });

  list = list.slice().sort(function (m, n) {
    if (app.sort === "closest") return m.distanceM - n.distanceM;
    if (app.sort === "pay") return n.quest.payoutMinor - m.quest.payoutMinor;
    if (app.sort === "ending") return ms(m.quest.expiresAt) - ms(n.quest.expiresAt);
    return ms(n.quest.createdAt) - ms(m.quest.createdAt);
  });

  var filtersOn = app.filters.radiusM !== DEFAULT_FILTERS.radiusM ||
    app.filters.minPayMinor !== DEFAULT_FILTERS.minPayMinor ||
    app.filters.verifiedOnly || app.filters.todayOnly;
  var narrowed = q || cat !== "all" || filtersOn;
  /* Only quests the viewer could actually take count towards the headline —
     their own money isn't "waiting" for them. */
  var takeable = list.filter(function (r) { return r.quest.posterId !== app.actorId; });
  var nearby = takeable.reduce(function (sum, r) { return sum + r.quest.payoutMinor; }, 0);

  return h("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
    h(TopBar, {
      wordmark: true,
      actions: h(IconButton, {
        icon: "bell", label: "Notifications", size: "sm",
        badge: app.unreadNotes || undefined,
        onClick: props.onNotifications
      })
    }),
    h(Body, null,
      h(Input, {
        icon: "search", placeholder: "Search quests near you", value: q,
        onChange: function (ev) { setQ(ev.target.value); }
      }),
      h("div", {
        style: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, minWidth: 0, flex: "none" }
      }, D.categories.map(function (c) {
        return h(Tag, {
          key: c.id, size: "sm", selected: cat === c.id,
          onSelect: function () { setCat(c.id); }
        }, c.label);
      })),
      takeable.length ? h(Card, { variant: "accent", padding: "md" },
        h("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
          h("div", { style: { flex: 1, minWidth: 0 } },
            h("div", {
              style: {
                font: "var(--weight-black) var(--text-xl)/1.1 var(--font-display)",
                letterSpacing: "var(--tracking-heading)"
              }
            }, formatMoney(nearby), " waiting nearby"),
            h("div", { style: { fontSize: "var(--text-2xs)", marginTop: 2 } },
              "Across " + takeable.length + " " + (takeable.length === 1 ? "quest" : "quests") +
              " you can take, within " + formatDistance(app.filters.radiusM))),
          h(Icon, { name: "coins", size: 24 }))) : null,
      h("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
        h("span", {
          style: {
            flex: 1, fontSize: "var(--text-2xs)", color: "var(--text-secondary)",
            fontWeight: "var(--weight-medium)"
          }
        }, list.length + " " + (list.length === 1 ? "quest" : "quests") + " · " + sortLabel(app.sort)),
        h(IconButton, {
          icon: "sliders-horizontal", label: "Sort and filter", size: "sm",
          active: filtersOn, onClick: openSheet
        })),
      list.length === 0
        ? h(EmptyState, {
            title: narrowed
              ? "Nothing matches that yet — widen the radius or clear the filters?"
              : "Nothing near you right now — widen the radius to 10 km?",
            action: narrowed ? "Clear filters" : "Widen search",
            onAction: function () {
              setQ(""); setCat("all");
              app.setFilters(narrowed ? DEFAULT_FILTERS : Object.assign({}, app.filters, { radiusM: 10000 }));
            }
          })
        : list.map(function (row) {
            var x = row.quest;
            var u = userOf(x.posterId);
            var mine = x.posterId === app.actorId;
            var pending = mine ? pendingOffersFor(state, x.id).length : 0;
            /* Your own quest has no poster to vouch for and no meaningful
               distance from you, so it uses the poster-less layout and shows
               where it is instead of how far. */
            return h(QuestCard, {
              key: x.id, variant: mine ? "spacious-meta" : "spacious", title: x.title,
              payout: formatMoney(x.payoutMinor),
              distance: mine ? x.area : formatDistance(row.distanceM),
              duration: formatDuration(x.estimatedMinutes),
              when: formatWhenAt(x.scheduledFor, app.now),
              category: categoryLabel(x.categoryId),
              badges: mine
                ? [{ label: pending ? pending + (pending === 1 ? " offer" : " offers") : "No offers yet", tone: pending ? "accent" : "neutral", icon: "user" }]
                : questBadges(x, app.now),
              poster: mine ? null : posterProp(u),
              saved: saved.indexOf(x.id) > -1,
              onSave: mine ? undefined : function () { app.toggleSave(x.id); },
              onClick: function () { props.onOpen(x.id); }
            });
          })),
    h(Dialog, {
      open: sheet, onClose: function () { setSheet(false); },
      title: "Sort and filter", subtitle: "Applies to the quest list",
      actions: h(Fragment, null,
        h(Button, {
          variant: "ghost",
          onClick: function () { setDraft({ filters: DEFAULT_FILTERS, sort: "closest" }); }
        }, "Reset"),
        h(Button, { fullWidth: true, onClick: applySheet }, "Show quests"))
    }, draft ? h(Fragment, null,
      h(Eyebrow, null, "Sort by"),
      SORTS.map(function (o) {
        return h(Radio, {
          key: o.value, name: "sort", label: o.label,
          checked: draft.sort === o.value,
          onChange: function () { setDraft({ filters: draft.filters, sort: o.value }); }
        });
      }),
      h(Select, {
        label: "Distance",
        options: [
          { value: "1000", label: "Within 1 km" },
          { value: "3000", label: "Within 3 km" },
          { value: "5000", label: "Within 5 km" },
          { value: "10000", label: "Within 10 km" }
        ],
        value: String(draft.filters.radiusM),
        onChange: function (ev) { patch("radiusM", parseInt(ev.target.value, 10)); }
      }),
      h(Select, {
        label: "Pays at least",
        options: [
          { value: "0", label: "Any amount" },
          { value: "20000", label: "NT$200" },
          { value: "30000", label: "NT$300" },
          { value: "50000", label: "NT$500" }
        ],
        value: String(draft.filters.minPayMinor),
        onChange: function (ev) { patch("minPayMinor", parseInt(ev.target.value, 10)); }
      }),
      h(Checkbox, {
        label: "Today only", checked: draft.filters.todayOnly,
        onChange: function () { patch("todayOnly", !draft.filters.todayOnly); }
      }),
      h(Checkbox, {
        label: "Verified posters only", checked: draft.filters.verifiedOnly,
        onChange: function () { patch("verifiedOnly", !draft.filters.verifiedOnly); }
      })) : null));
}

/* ---------------- Quest detail ----------------
   One screen, four points of view. What the viewer can do is decided by
   roleOn() and the §8 transition table — never by which tab they arrived
   from — so the poster, the accepted doer, someone with an offer in and a
   passer-by each see a truthful set of actions on the same record. */

function QuestDetailScreen(props) {
  var app = props.app, state = app.state, quest = props.quest;
  var role = roleOn(state, quest, app.actorId);
  var poster = userOf(quest.posterId);
  var accepted = acceptedOfferFor(state, quest);
  var mine = myOfferOn(state, quest.id, app.actorId);
  var counterpart = counterpartOf(state, quest, app.actorId);
  var distanceM = app.distanceTo(quest);
  var addressShown = addressVisibleTo(state, quest, app.actorId);
  var pending = pendingOffersFor(state, quest.id);
  var myReview = myReviewOn(state, quest.id, app.actorId);

  var of = React.useState(false);
  var offerSheet = of[0], setOfferSheet = of[1];
  var md = React.useState("asking");
  var mode = md[0], setMode = md[1];
  var pr = React.useState(String(quest.payoutMinor / 100));
  var price = pr[0], setPrice = pr[1];
  var nt = React.useState("");
  var note = nt[0], setNote = nt[1];
  var cs = React.useState(false);
  var cancelSheet = cs[0], setCancelSheet = cs[1];
  var dsh = React.useState(false);
  var disputeSheet = dsh[0], setDisputeSheet = dsh[1];
  var rs = React.useState(false);
  var rateSheet = rs[0], setRateSheet = rs[1];
  var ac = React.useState(null);
  var acceptFor = ac[0], setAcceptFor = ac[1];

  var offerMinor = mode === "asking" ? quest.payoutMinor : Math.max(0, Math.round(parseFloat(price || "0") * 100));
  var canOffer = role === "visitor" && quest.status === "open";
  var thread = counterpart ? threadFor(state, quest.id, role === "poster" ? counterpart.id : app.actorId) : null;

  function slabActions() {
    if (quest.status === "paid") {
      if ((role === "poster" || role === "doer") && !myReview) {
        return [h(Button, {
          key: "rate", variant: "money", size: "lg", icon: "star", fullWidth: true,
          onClick: function () { setRateSheet(true); }
        }, "Leave a rating")];
      }
      return null;
    }
    if (isClosed(quest.status)) return null;
    if (quest.status === "disputed") return null;

    if (role === "poster") {
      var out = [h(Button, {
        key: "cancel", variant: "secondary", size: "lg",
        style: { padding: "0 16px" },
        onClick: function () { setCancelSheet(true); }
      }, "Cancel")];
      if (quest.status === "open") {
        out.push(h(Button, {
          key: "offers", variant: "primary", size: "lg", icon: "users", fullWidth: true,
          onClick: function () { props.onReviewOffers(quest.id); }
        }, pending.length ? "Review " + pending.length + (pending.length === 1 ? " offer" : " offers") : "Review offers"));
      } else if (quest.status === "completed") {
        out = [h(Button, {
          key: "dispute", variant: "secondary", size: "lg", style: { padding: "0 16px" },
          onClick: function () { setDisputeSheet(true); }
        }, "Raise an issue"), h(Button, {
          key: "confirm", variant: "money", size: "lg", icon: "check", fullWidth: true,
          onClick: function () { app.confirmDone(quest); }
        }, "Confirm and pay")];
      } else {
        out.push(h(Button, {
          key: "chat", variant: "primary", size: "lg", icon: "message-circle", fullWidth: true,
          onClick: function () { props.onOpenThread(thread); }
        }, "Open chat"));
      }
      return out;
    }

    if (role === "doer") {
      var left = [h(Button, {
        key: "cancel", variant: "secondary", size: "lg", style: { padding: "0 16px" },
        onClick: function () { setCancelSheet(true); }
      }, "Cancel")];
      if (quest.status === "assigned") {
        left.push(h(Button, {
          key: "start", variant: "primary", size: "lg", icon: "zap", fullWidth: true,
          onClick: function () { app.startQuest(quest); }
        }, "Start quest"));
      } else if (quest.status === "in_progress") {
        left.push(h(Button, {
          key: "done", variant: "primary", size: "lg", icon: "check", fullWidth: true,
          onClick: function () { app.markDone(quest); }
        }, "Mark as done"));
      } else {
        return [h(Button, {
          key: "chat", variant: "secondary", size: "lg", icon: "message-circle", fullWidth: true,
          onClick: function () { props.onOpenThread(thread); }
        }, "Open chat")];
      }
      return left;
    }

    if (role === "applicant") {
      return [h(Button, {
        key: "chat", variant: "secondary", size: "lg", icon: "message-circle", fullWidth: true,
        onClick: function () { props.onOpenThread(threadFor(state, quest.id, app.actorId)); }
      }, "Open chat")];
    }

    if (canOffer) {
      return [h(Button, {
        key: "ask", variant: "secondary", size: "lg", icon: "message-circle",
        style: { padding: "0 18px" },
        onClick: function () { setOfferSheet(true); }
      }, "Ask"), h(Button, {
        key: "take", variant: "primary", size: "lg", icon: "zap", fullWidth: true,
        onClick: function () { setOfferSheet(true); }
      }, "Take this quest")];
    }
    return null;
  }
  var actions = slabActions();

  return h("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
    h(TopBar, {
      title: quest.title,
      subtitle: formatDistance(distanceM) + " · " + formatWhenAt(quest.scheduledFor, app.now),
      onBack: props.onBack,
      actions: role === "poster" ? null : h(IconButton, {
        icon: "heart", label: "Save", size: "sm",
        filled: savedFor(state, app.actorId).indexOf(quest.id) > -1,
        onClick: function () { app.toggleSave(quest.id); },
        style: { color: savedFor(state, app.actorId).indexOf(quest.id) > -1 ? "var(--flare-500)" : undefined }
      })
    }),
    h(Body, null,
      h(Card, { padding: "lg" },
        h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
          quest.status === "open"
            ? questBadges(quest, app.now).map(function (bd) {
                return h(Badge, { key: bd.label, tone: bd.tone, icon: bd.icon, size: "sm" }, bd.label);
              })
            : h(StatusBadge, { status: quest.status }),
          h(Tag, { size: "sm" }, categoryLabel(quest.categoryId))),
        h("h2", {
          style: {
            margin: "2px 0 0",
            font: "var(--weight-black) var(--type-title-size)/var(--leading-snug) var(--font-display)",
            letterSpacing: "var(--tracking-heading)"
          }
        }, quest.title),
        h(RewardPill, {
          amount: formatMoney(quest.payoutMinor), size: "lg",
          unit: quest.payoutUnit === "hourly" ? "per hour" : null
        }),
        h("p", {
          style: {
            margin: 0, fontSize: "var(--text-sm)",
            lineHeight: "var(--leading-normal)", color: "var(--ink-700)"
          }
        }, quest.details)),

      h(ClosedNote, { quest: quest, actorId: app.actorId }),

      quest.status === "completed" ? h(ConfirmWindow, {
        quest: quest, now: app.now, doerSide: role === "doer"
      }) : null,

      h(AddressBlock, { quest: quest, visible: addressShown, distanceM: distanceM }),

      h(Card, null,
        h(InfoRow, { icon: "clock", label: "How long", value: formatDuration(quest.estimatedMinutes) }),
        h(InfoRow, { icon: "calendar", label: "When", value: formatWhenAt(quest.scheduledFor, app.now) }),
        quest.status === "open" && quest.expiresAt && ms(quest.expiresAt) > app.now
          ? h(InfoRow, { icon: "zap", label: "Offers close", value: "in " + formatRemaining(quest.expiresAt, app.now) })
          : null,
        h(InfoRow, {
          icon: "coins", label: "Payment", last: true,
          value: accepted
            ? (quest.status === "paid" ? "Released" : quest.status === "cancelled" ? "Refunded" : "Held")
            : "Held on acceptance"
        })),

      (quest.requirements || []).length ? h(Card, { variant: "sunken", padding: "md" },
        h(Eyebrow, null, "What's needed"),
        quest.requirements.map(function (r) {
          return h("div", { key: r, style: { display: "flex", gap: 8, alignItems: "flex-start" } },
            h(Icon, { name: "check", size: 15, strokeWidth: 2.5, style: { marginTop: 2 } }),
            h("span", { style: { fontSize: "var(--text-sm)" } }, r));
        })) : null,

      /* Whose trust panel this is depends on who is looking: a doer needs to
         know the poster, a poster needs to know the person they matched with. */
      (function () {
        var subject = role === "poster" ? (counterpart || null) : poster;
        if (!subject) return null;
        return h(Card, null,
          h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } },
            h(UserChip, {
              name: subject.name, rating: subject.rating, quests: subject.questsCompleted,
              verified: subject.verified, size: "lg",
              meta: role === "poster" ? "Doing this quest" : "Posted this quest"
            }),
            h(IconButton, {
              icon: "user", label: "See profile", size: "sm",
              onClick: function () { props.onOpenProfile(subject.id); }
            })),
          h("div", {
            style: {
              display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 10,
              borderTop: "var(--border-hair) solid var(--border-subtle)"
            }
          },
            subject.verified ? h(Badge, { tone: "success", icon: "shield-check", size: "sm" }, "ID verified") : null,
            h(Badge, { size: "sm" }, Math.round(subject.cancelRate * 100) + "% cancelled"),
            quest.status === "open" ? h(Badge, { size: "sm" },
              pending.length + (pending.length === 1 ? " offer" : " offers")) : null));
      })(),

      mine && mine.status !== "accepted" ? h(MyOfferPanel, {
        offer: mine,
        onWithdraw: function () { app.withdrawOffer(mine); }
      }) : null,

      /* The fee is disclosed to whoever is about to be affected by it. */
      role === "doer" && !isClosed(quest.status) && accepted
        ? h(FeeBreakdown, {
            amountMinor: accepted.amountMinor, doerSide: true,
            title: "What you'll be paid",
            note: quest.status === "completed"
              ? "The money is held. It lands in your wallet when " + poster.name + " confirms, or automatically when the window closes."
              : "The money is already held. It lands in your wallet once the quest is confirmed done."
          }) : null,

      quest.status === "paid" ? (function () {
        if (role !== "poster" && role !== "doer") return null;
        if (myReview) {
          return h(Card, { variant: "sunken", padding: "md" },
            h("div", { style: { display: "flex", gap: 10, alignItems: "center" } },
              h(Icon, { name: "star", size: 17, filled: true, color: "var(--coin-600)" }),
              h("span", { style: { flex: 1, fontSize: "var(--text-sm)" } },
                "You rated this " + myReview.rating + " out of 5"),
              counterpart && myReviewOn(state, quest.id, counterpart.id)
                ? h(Badge, { tone: "success", size: "sm" }, "Both rated")
                : h(Badge, { size: "sm" }, "Waiting on them")));
        }
        return h(EmptyState, {
          title: "Rate " + (counterpart ? counterpart.name : "them") + " — it's what the next person goes on.",
          action: "Leave a rating",
          onAction: function () { setRateSheet(true); }
        });
      })() : null,

      quest.status === "open" && role === "visitor" ? h("span", {
        style: { fontSize: "var(--text-2xs)", color: "var(--text-muted)", textAlign: "center" }
      }, "Nothing leaves your wallet — the poster holds the money, not you.") : null),

    actions ? h(Slab, null, actions) : null,

    /* ---- sheets ---- */
    h(Dialog, {
      open: offerSheet, onClose: function () { setOfferSheet(false); },
      title: "Make your offer",
      subtitle: "One offer per quest — you can withdraw it while it's pending",
      actions: h(Fragment, null,
        h(Button, { variant: "ghost", onClick: function () { setOfferSheet(false); } }, "Cancel"),
        h(Button, {
          fullWidth: true, disabled: offerMinor <= 0,
          onClick: function () {
            setOfferSheet(false);
            app.sendOffer(quest, offerMinor, note);
            props.onOffered(quest.id);
          }
        }, "Send offer"))
    },
      h(Radio, {
        name: "mode", label: "Take it at " + formatMoney(quest.payoutMinor),
        description: "Accept the asking price", checked: mode === "asking",
        onChange: function () { setMode("asking"); }
      }),
      h(Radio, {
        name: "mode", label: "Offer a different price",
        description: "Say what you'd do it for", checked: mode === "custom",
        onChange: function () { setMode("custom"); }
      }),
      mode === "custom" ? h(Input, {
        label: "Your price", prefix: "NT$", value: price,
        onChange: function (ev) { setPrice(ev.target.value.replace(/[^0-9.]/g, "")); }
      }) : null,
      h(Input, {
        label: "Add a note", multiline: true, rows: 2, value: note,
        onChange: function (ev) { setNote(ev.target.value); },
        placeholder: "I walk two dogs on this street already — happy to send a photo mid-walk."
      }),
      offerMinor > 0 ? h(FeeBreakdown, {
        amountMinor: offerMinor, doerSide: true, title: "If this is accepted",
        note: poster.name + " holds the money the moment they accept, so it's there before you start."
      }) : null),

    h(CancelSheet, {
      open: cancelSheet, quest: quest, acceptedOffer: accepted,
      onClose: function () { setCancelSheet(false); },
      onConfirm: function (reason) {
        setCancelSheet(false);
        app.cancelQuest(quest, reason);
      }
    }),
    h(DisputeSheet, {
      open: disputeSheet,
      onClose: function () { setDisputeSheet(false); },
      onConfirm: function (reason) {
        setDisputeSheet(false);
        app.disputeQuest(quest, reason);
      }
    }),
    h(RateSheet, {
      open: rateSheet, counterpart: counterpart,
      onClose: function () { setRateSheet(false); },
      onConfirm: function (rating, comment) {
        setRateSheet(false);
        app.submitReview(quest, rating, comment);
      }
    }));
}

/* ---------------- Date & time picker sheets ----------------
   Same tap-to-open bottom sheet as the filter IconButton (the DS Dialog,
   variant "sheet"), styled from our own tokens — no native <input type=date>
   or type=time>, so no browser chrome and no duplicate icon. */

function formatDateLabel(iso) {
  if (!iso) return "";
  var todayISO = D.now.slice(0, 10);
  var tmrISO = addDaysISO(todayISO, 1);
  if (iso === todayISO) return "Today";
  if (iso === tmrISO) return "Tomorrow";
  var p = iso.split("-").map(Number);
  var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}
function PickerField(props) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      width: "100%"
    }
  }, props.label ? /*#__PURE__*/React.createElement("label", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-primary)"
    }
  }, props.label) : null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: props.onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: "var(--control-height-md)",
      padding: "0 14px",
      width: "100%",
      background: "var(--paper-000)",
      border: "var(--border-width) solid " + (props.error ? "var(--danger-500)" : "var(--ink-200)"),
      borderRadius: "var(--radius-field)",
      boxShadow: "var(--shadow-inset-field)",
      cursor: "pointer",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: props.icon,
    size: 18,
    color: "var(--ink-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-md)",
      color: props.value ? "var(--text-primary)" : "var(--ink-400)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, props.value || props.placeholder), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 16,
    color: "var(--ink-400)"
  })), props.error ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-xs)",
      color: "var(--text-danger)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert-triangle",
    size: 13,
    strokeWidth: 2
  }), props.error) : null);
}
function MonthCalendarPicker(props) {
  var todayISO = D.now.slice(0, 10);
  var minISO = props.minISO || todayISO;
  var initISO = props.value || todayISO;
  var initP = initISO.split("-").map(Number);
  var cs = React.useState(new Date(Date.UTC(initP[0], initP[1] - 1, 1)));
  var cursor = cs[0],
    setCursor = cs[1];
  var year = cursor.getUTCFullYear();
  var month = cursor.getUTCMonth();
  var firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  var daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  var minP = minISO.split("-").map(Number);
  var minMonthStart = Date.UTC(minP[0], minP[1] - 1, 1);
  var cells = [];
  for (var i = 0; i < firstWeekday; i++) cells.push(null);
  for (var day = 1; day <= daysInMonth; day++) cells.push(day);
  function isoOf(d) {
    return year + "-" + String(month + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-left",
    label: "Previous month",
    size: "sm",
    variant: "ghost",
    disabled: Date.UTC(year, month, 1) <= minMonthStart,
    onClick: function () {
      setCursor(new Date(Date.UTC(year, month - 1, 1)));
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-bold)",
      fontSize: "var(--text-md)"
    }
  }, cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  })), /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-right",
    label: "Next month",
    size: "sm",
    variant: "ghost",
    onClick: function () {
      setCursor(new Date(Date.UTC(year, month + 1, 1)));
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 4,
      marginBottom: 4
    }
  }, ["S", "M", "T", "W", "T", "F", "S"].map(function (w, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: "wd" + i,
      style: {
        textAlign: "center",
        fontSize: "var(--text-2xs)",
        fontWeight: "var(--weight-bold)",
        color: "var(--ink-400)"
      }
    }, w);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 4
    }
  }, cells.map(function (d, i) {
    if (d == null) return /*#__PURE__*/React.createElement("div", {
      key: "e" + i
    });
    var iso = isoOf(d);
    var disabled = iso < minISO;
    var selected = iso === props.value;
    var isToday = iso === todayISO;
    return /*#__PURE__*/React.createElement("button", {
      key: iso,
      type: "button",
      disabled: disabled,
      onClick: function () {
        props.onChange(iso);
      },
      style: {
        aspectRatio: "1",
        display: "grid",
        placeItems: "center",
        borderRadius: "var(--radius-pill)",
        border: selected ? "var(--border-width) solid var(--ink-900)" : isToday ? "var(--border-hair) solid var(--ink-400)" : "var(--border-width) solid transparent",
        background: selected ? "var(--lime-500)" : "transparent",
        color: disabled ? "var(--ink-200)" : "var(--ink-900)",
        fontFamily: "var(--font-text)",
        fontWeight: selected ? "var(--weight-bold)" : "var(--weight-medium)",
        fontSize: "var(--text-sm)",
        cursor: disabled ? "not-allowed" : "pointer"
      }
    }, d);
  })));
}
var WHEEL_ITEM_H = 36;
function WheelColumn(props) {
  var ref = React.useRef(null);
  var timer = React.useRef(null);
  React.useEffect(function () {
    if (ref.current) ref.current.scrollTop = props.index * WHEEL_ITEM_H;
    // eslint-disable-next-line
  }, []);
  function handleScroll() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(function () {
      if (!ref.current) return;
      var idx = Math.round(ref.current.scrollTop / WHEEL_ITEM_H);
      idx = Math.max(0, Math.min(props.items.length - 1, idx));
      if (idx !== props.index) props.onChange(idx);
    }, 100);
  }
  function tap(idx) {
    props.onChange(idx);
    if (ref.current) ref.current.scrollTo({
      top: idx * WHEEL_ITEM_H,
      behavior: "smooth"
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: "yd-wheel",
    onScroll: handleScroll,
    style: {
      height: WHEEL_ITEM_H * 5,
      overflowY: "auto",
      scrollSnapType: "y mandatory",
      WebkitOverflowScrolling: "touch",
      padding: WHEEL_ITEM_H * 2 + "px 0",
      width: props.width || 64
    }
  }, props.items.map(function (label, idx) {
    var on = idx === props.index;
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      onClick: function () {
        tap(idx);
      },
      style: {
        height: WHEEL_ITEM_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        scrollSnapAlign: "center",
        fontFamily: "var(--font-display)",
        fontSize: on ? "var(--text-lg)" : "var(--text-md)",
        fontWeight: on ? "var(--weight-black)" : "var(--weight-medium)",
        color: on ? "var(--ink-900)" : "var(--ink-300)",
        cursor: "pointer",
        transition: "color var(--duration-fast) var(--ease-out)"
      }
    }, label);
  }));
}
var WHEEL_HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
var WHEEL_MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
var WHEEL_AMPM = ["AM", "PM"];
function timeToWheelIndices(hhmm) {
  var p = (hhmm || "09:00").split(":");
  var h24 = parseInt(p[0], 10);
  var m = parseInt(p[1], 10);
  var ampmIdx = h24 >= 12 ? 1 : 0;
  var h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return {
    hourIdx: h12 - 1,
    minuteIdx: Math.round(m / 5) % 12,
    ampmIdx: ampmIdx
  };
}
function wheelIndicesToTime(hourIdx, minuteIdx, ampmIdx) {
  var h12 = hourIdx + 1;
  var h24 = ampmIdx === 1 ? h12 === 12 ? 12 : h12 + 12 : h12 === 12 ? 0 : h12;
  var m = minuteIdx * 5;
  return String(h24).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}
function TimeWheelPicker(props) {
  var initIdx = timeToWheelIndices(props.value);
  var hs = React.useState(initIdx.hourIdx);
  var hourIdx = hs[0],
    setHourIdx = hs[1];
  var ms = React.useState(initIdx.minuteIdx);
  var minuteIdx = ms[0],
    setMinuteIdx = ms[1];
  var as = React.useState(initIdx.ampmIdx);
  var ampmIdx = as[0],
    setAmpmIdx = as[1];
  React.useEffect(function () {
    props.onChange(wheelIndicesToTime(hourIdx, minuteIdx, ampmIdx));
    // eslint-disable-next-line
  }, [hourIdx, minuteIdx, ampmIdx]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("style", null, ".yd-wheel::-webkit-scrollbar{display:none}"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      top: "50%",
      transform: "translateY(-" + WHEEL_ITEM_H / 2 + "px)",
      height: WHEEL_ITEM_H,
      borderTop: "var(--border-hair) solid var(--ink-200)",
      borderBottom: "var(--border-hair) solid var(--ink-200)",
      background: "var(--paper-100)",
      pointerEvents: "none",
      borderRadius: "var(--radius-sm)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(WheelColumn, {
    items: WHEEL_HOURS,
    index: hourIdx,
    onChange: setHourIdx,
    width: 56
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-black)",
      fontSize: "var(--text-lg)"
    }
  }, ":"), /*#__PURE__*/React.createElement(WheelColumn, {
    items: WHEEL_MINUTES,
    index: minuteIdx,
    onChange: setMinuteIdx,
    width: 56
  }), /*#__PURE__*/React.createElement(WheelColumn, {
    items: WHEEL_AMPM,
    index: ampmIdx,
    onChange: setAmpmIdx,
    width: 64
  })));
}

/* ---------------- Post a quest ---------------- */


/* ---------------- Post a quest ----------------
   The multi-step wizard from PRD §7.4: what → where & when → budget → review.
   Validation blocks the step it belongs to rather than failing at the end, and
   the draft autosaves so closing the app doesn't cost you the typing. */

var POST_STEPS = [
  { key: "what", label: "What" },
  { key: "where", label: "Where & when" },
  { key: "budget", label: "Budget" },
  { key: "review", label: "Review" }
];
var DURATIONS = [
  { value: "20", label: "~20 min" }, { value: "30", label: "~30 min" },
  { value: "45", label: "~45 min" }, { value: "60", label: "~1 hr" },
  { value: "120", label: "~2 hr" }, { value: "180", label: "~3 hr" }
];
/* PRD §14.4 has not settled the default expiry window, so it is a choice here
   rather than a hidden constant — whichever way it lands, this is the screen
   that changes. */
var EXPIRY_OPTIONS = [
  { value: "before", label: "An hour before it starts" },
  { value: "24h", label: "In 24 hours" },
  { value: "start", label: "When it starts" }
];
var DRAFT_KEY = "youdo-quest-draft";

function tpeISO(dateStr, timeStr) {
  return dateStr + "T" + timeStr + ":00+08:00";
}
function loadDraft() {
  try {
    var raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}
function saveDraft(form) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch (e) {}
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
}

function StepHeader(props) {
  return h("div", { style: { display: "flex", flexDirection: "column", gap: 8, flex: "none" } },
    h("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
      h(Eyebrow, { style: { flex: 1 } },
        "Step " + (props.index + 1) + " of " + POST_STEPS.length + " · " + POST_STEPS[props.index].label),
      props.onDiscard ? h(Button, { size: "sm", variant: "ghost", onClick: props.onDiscard }, "Start over") : null),
    h("div", { style: { display: "flex", gap: 4 } },
      POST_STEPS.map(function (s, i) {
        return h("span", {
          key: s.key,
          style: {
            flex: 1, height: 6,
            background: i <= props.index ? "var(--lime-500)" : "var(--paper-000)",
            border: "var(--border-hair) solid var(--border-strong)",
            borderRadius: "var(--radius-pill)"
          }
        });
      })));
}

var EMPTY_FORM = {
  title: "", details: "", categoryId: "delivery",
  address: "", area: "Da'an", date: "", time: "", minutes: "60",
  expiry: "before", unit: "fixed", budget: ""
};

function PostQuestScreen(props) {
  var app = props.app;
  var fm = React.useState(function () { return Object.assign({}, EMPTY_FORM, loadDraft() || {}); });
  var form = fm[0], setForm = fm[1];
  var ix = React.useState(0);
  var step = ix[0], setStep = ix[1];
  var tr = React.useState({});
  var tried = tr[0], setTried = tr[1];
  var ds = React.useState(false);
  var dateSheet = ds[0], setDateSheet = ds[1];
  var tsh = React.useState(false);
  var timeSheet = tsh[0], setTimeSheet = tsh[1];
  var resumed = React.useRef(!!loadDraft());

  React.useEffect(function () { saveDraft(form); }, [form]);
  function set(k, v) {
    var o = {};
    o[k] = v;
    setForm(Object.assign({}, form, o));
  }

  var budgetMinor = Math.max(0, Math.round(parseFloat(form.budget || "0") * 100));
  var minutes = parseInt(form.minutes, 10) || 60;
  /* An hourly budget is a rate; the total is what the poster actually holds. */
  var totalMinor = form.unit === "hourly" ? Math.round(budgetMinor * minutes / 60) : budgetMinor;

  var errors = {
    title: form.title.trim().length < 8 ? "Give it a few more words so doers know what's involved" : null,
    address: form.address.trim() === "" ? "Add an address so doers know how far it is" : null,
    when: !form.date || !form.time ? "Pick a date and a time" : null,
    budget: budgetMinor <= 0 ? "Name a price so doers know what's on offer" : null
  };
  var STEP_FIELDS = { what: ["title"], where: ["address", "when"], budget: ["budget"], review: [] };
  function stepValid(i) {
    return STEP_FIELDS[POST_STEPS[i].key].every(function (f) { return !errors[f]; });
  }
  function show(field) {
    return tried[POST_STEPS[step].key] && errors[field] ? errors[field] : undefined;
  }
  function next() {
    if (!stepValid(step)) {
      var t = Object.assign({}, tried);
      t[POST_STEPS[step].key] = true;
      setTried(t);
      return;
    }
    setStep(Math.min(POST_STEPS.length - 1, step + 1));
  }
  function expiryISO(scheduled) {
    if (form.expiry === "start") return scheduled;
    if (form.expiry === "24h") return isoAt(app.now + 24 * HOUR_MS);
    return isoAt(ms(scheduled) - HOUR_MS);
  }
  function submit() {
    var scheduled = tpeISO(form.date, form.time);
    var id = app.postQuest({
      title: form.title.trim(), details: form.details.trim(),
      categoryId: form.categoryId, payoutMinor: totalMinor, payoutUnit: form.unit,
      estimatedMinutes: minutes, addressLine: form.address.trim(), area: form.area,
      point: D.areas[form.area], scheduledFor: scheduled, expiresAt: expiryISO(scheduled),
      requirements: []
    });
    clearDraft();
    setForm(Object.assign({}, EMPTY_FORM));
    setStep(0);
    setTried({});
    resumed.current = false;
    props.onPosted(id);
  }
  function discard() {
    clearDraft();
    setForm(Object.assign({}, EMPTY_FORM));
    setStep(0);
    setTried({});
    resumed.current = false;
  }

  var key = POST_STEPS[step].key;
  var whenLabel = form.date && form.time ? formatWhenAt(tpeISO(form.date, form.time), app.now) : "";

  return h("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
    h(TopBar, {
      title: "Post a quest", subtitle: "Takes about a minute",
      onBack: step > 0 ? function () { setStep(step - 1); } : undefined
    }),
    h(Body, null,
      h(StepHeader, { index: step, onDiscard: form.title || form.budget ? discard : null }),

      resumed.current && step === 0 ? h(Card, { variant: "sunken", padding: "sm" },
        h("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
          h(Icon, { name: "pencil", size: 15, color: "var(--ink-500)" }),
          h("span", { style: { flex: 1, fontSize: "var(--text-2xs)", color: "var(--text-secondary)" } },
            "Picked up where you left off."))) : null,

      key === "what" ? h(Card, { padding: "lg" },
        h(Input, {
          label: "What needs doing?", placeholder: "Walk my dog for an hour",
          value: form.title, onChange: function (ev) { set("title", ev.target.value); },
          hint: show("title") ? undefined : "Say the thing and the bound — “Walk Biscuit for an hour”",
          error: show("title")
        }),
        h(Input, {
          label: "Details", multiline: true, rows: 3, value: form.details,
          onChange: function (ev) { set("details", ev.target.value); },
          placeholder: "Anything a stranger would need to know: access, tools, timing."
        }),
        h(Select, {
          label: "Category",
          options: D.categories.slice(1).map(function (x) { return { value: x.id, label: x.label }; }),
          value: form.categoryId, onChange: function (ev) { set("categoryId", ev.target.value); }
        })) : null,

      key === "where" ? h(Fragment, null,
        h(Card, { padding: "lg" },
          h(Eyebrow, null, "Where"),
          h(Input, {
            label: "Address", icon: "map-pin", placeholder: "14B, Lane 31, Yongkang St",
            value: form.address, onChange: function (ev) { set("address", ev.target.value); },
            error: show("address")
          }),
          h(Select, {
            label: "District",
            options: Object.keys(D.areas).map(function (a) { return { value: a, label: a }; }),
            value: form.area, onChange: function (ev) { set("area", ev.target.value); }
          }),
          h(Card, { variant: "sunken", padding: "md" },
            h("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } },
              h(Icon, { name: "lock", size: 16, color: "var(--ink-500)", style: { marginTop: 1 } }),
              h("span", {
                style: { fontSize: "var(--text-2xs)", lineHeight: "var(--leading-normal)", color: "var(--text-secondary)" }
              }, "Doers see the district and how far it is. The full address only reaches the person you accept.")))),
        h(Card, { padding: "lg" },
          h(Eyebrow, null, "When"),
          h(PickerField, {
            label: "Date", icon: "calendar", value: formatDateLabel(form.date),
            placeholder: "Choose a date",
            error: tried.where && errors.when && !form.date ? errors.when : undefined,
            onClick: function () { setDateSheet(true); }
          }),
          h(PickerField, {
            label: "Time", icon: "clock", value: form.time ? formatTime12(form.time) : "",
            placeholder: "Choose a time",
            error: tried.where && errors.when && !form.time ? errors.when : undefined,
            onClick: function () { setTimeSheet(true); }
          }),
          h(Select, {
            label: "How long will it take?", options: DURATIONS,
            value: form.minutes, onChange: function (ev) { set("minutes", ev.target.value); }
          }),
          h(Select, {
            label: "Offers close", options: EXPIRY_OPTIONS,
            value: form.expiry, onChange: function (ev) { set("expiry", ev.target.value); },
            hint: "After that it stops showing in the feed and any offers expire."
          }))) : null,

      key === "budget" ? h(Card, { padding: "lg" },
        h(Eyebrow, null, "What's it worth"),
        h(Tabs, {
          value: form.unit, onChange: function (v) { set("unit", v); },
          items: [{ value: "fixed", label: "Fixed price" }, { value: "hourly", label: "Per hour" }]
        }),
        h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
          (form.unit === "hourly" ? [30000, 35000, 40000, 50000] : [20000, 30000, 40000, 60000]).map(function (p) {
            return h(Tag, {
              key: p, selected: budgetMinor === p,
              onSelect: function () { set("budget", String(p / 100)); }
            }, formatMoney(p));
          })),
        h(Input, {
          label: form.unit === "hourly" ? "Or set your own rate" : "Or set your own",
          prefix: "NT$", suffix: form.unit === "hourly" ? "per hour" : undefined,
          value: form.budget,
          onChange: function (ev) { set("budget", ev.target.value.replace(/[^0-9.]/g, "")); },
          error: show("budget")
        }),
        form.unit === "hourly" && budgetMinor > 0 ? h(Card, { variant: "sunken", padding: "md" },
          h(InfoRow, {
            icon: "coins", label: formatDuration(minutes) + " at " + formatMoney(budgetMinor) + " an hour",
            value: formatMoney(totalMinor), last: true
          })) : null,
        budgetMinor > 0 ? h(FeeBreakdown, {
          amountMinor: totalMinor, title: "What this costs you",
          note: "Nothing leaves your wallet now. We hold " + formatMoney(totalMinor) + " when you accept someone, and it comes straight back if the quest is cancelled."
        }) : null) : null,

      key === "review" ? h(Fragment, null,
        h(Card, { padding: "lg" },
          h(Tag, { size: "sm" }, categoryLabel(form.categoryId)),
          h("h2", {
            style: {
              margin: "8px 0 0",
              font: "var(--weight-black) var(--type-title-size)/var(--leading-snug) var(--font-display)",
              letterSpacing: "var(--tracking-heading)"
            }
          }, form.title),
          h(RewardPill, {
            amount: formatMoney(totalMinor), size: "lg",
            unit: form.unit === "hourly" ? formatMoney(budgetMinor) + " an hour" : null
          }),
          form.details ? h("p", {
            style: {
              margin: 0, fontSize: "var(--text-sm)",
              lineHeight: "var(--leading-normal)", color: "var(--ink-700)"
            }
          }, form.details) : null),
        h(Card, null,
          h(InfoRow, { icon: "map-pin", label: "Where", value: form.area }),
          h(InfoRow, { icon: "calendar", label: "When", value: whenLabel }),
          h(InfoRow, { icon: "clock", label: "How long", value: formatDuration(minutes) }),
          h(InfoRow, {
            icon: "zap", label: "Offers close", last: true,
            value: form.date && form.time ? formatWhenAt(expiryISO(tpeISO(form.date, form.time)), app.now) : "—"
          })),
        h(FeeBreakdown, {
          amountMinor: totalMinor, title: "Before you post",
          note: "Nothing leaves your wallet now. We hold " + formatMoney(totalMinor) + " when you accept someone, and it comes straight back if the quest is cancelled."
        }),
        h(Card, { variant: "sunken", padding: "md" },
          h("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } },
            h(Icon, { name: "lock", size: 16, color: "var(--ink-500)", style: { marginTop: 1 } }),
            h("span", {
              style: { fontSize: "var(--text-2xs)", lineHeight: "var(--leading-normal)", color: "var(--text-secondary)" }
            }, "Doers see “" + form.address + "” only after you accept them. Until then it's " + form.area + " and a distance.")))) : null),

    h(Dialog, {
      open: dateSheet, onClose: function () { setDateSheet(false); }, title: "Pick a date",
      actions: h(Button, {
        fullWidth: true,
        onClick: function () {
          if (!form.date) set("date", D.now.slice(0, 10));
          setDateSheet(false);
        }
      }, "Done")
    }, h(MonthCalendarPicker, {
      value: form.date, minISO: D.now.slice(0, 10),
      onChange: function (iso) { set("date", iso); }
    })),
    h(Dialog, {
      open: timeSheet, onClose: function () { setTimeSheet(false); }, title: "Pick a time",
      actions: h(Button, { fullWidth: true, onClick: function () { setTimeSheet(false); } }, "Done")
    }, h(TimeWheelPicker, {
      value: form.time || "18:00", onChange: function (t) { set("time", t); }
    })),

    h(Slab, null,
      step > 0 ? h(Button, {
        variant: "secondary", size: "lg", style: { padding: "0 16px" },
        onClick: function () { setStep(step - 1); }
      }, "Back") : null,
      totalMinor > 0 ? h(RewardPill, { amount: formatMoney(totalMinor), unit: null }) : null,
      key === "review"
        ? h(Button, { size: "lg", fullWidth: true, icon: "plus", onClick: submit }, "Post quest")
        : h(Button, { size: "lg", fullWidth: true, iconRight: "arrow-right", onClick: next }, "Keep going")));
}

/* ---------------- Offer inbox ----------------
   The poster side the exported kit never had: offers arrived nowhere and
   there was nothing to accept them with. Accepting is the only action in the
   app that moves money, so it discloses the fee and the hold first. */

function OfferInboxScreen(props) {
  var app = props.app, state = app.state, quest = props.quest;
  var pending = pendingOffersFor(state, quest.id);
  var decided = offersFor(state, quest.id).filter(function (o) { return o.status !== "pending"; });
  var cf = React.useState(null);
  var confirming = cf[0], setConfirming = cf[1];
  var available = app.available;
  var short = confirming ? confirming.amountMinor - available : 0;

  return h("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
    h(TopBar, {
      title: "Offers", subtitle: quest.title, onBack: props.onBack
    }),
    h(Body, null,
      h(Card, { variant: "sunken", padding: "md" },
        h(InfoRow, { icon: "coins", label: "You're asking", value: formatMoney(quest.payoutMinor) }),
        h(InfoRow, { icon: "wallet", label: "In your wallet", value: formatMoney(available) }),
        h(InfoRow, {
          icon: "clock", label: "Offers close", last: true,
          value: quest.expiresAt && ms(quest.expiresAt) > app.now
            ? "in " + formatRemaining(quest.expiresAt, app.now) : "Closed"
        })),

      pending.length === 0
        ? h(EmptyState, {
            title: decided.length
              ? "No offers left to decide — the rest have been answered."
              : "No offers yet. Quests with a clear title and a fair price usually get one within the hour.",
            action: "Back to the quest",
            onAction: props.onBack
          })
        : h(Fragment, null,
            h(Eyebrow, null, pending.length + (pending.length === 1 ? " offer waiting" : " offers waiting")),
            pending.map(function (o) {
              return h(OfferRow, {
                key: o.id, offer: o, quest: quest, now: app.now,
                onAccept: function () { setConfirming(o); },
                onDecline: function () { app.declineOffer(o); },
                onMessage: function () { props.onOpenThread(threadFor(state, quest.id, o.doerId)); }
              });
            })),

      decided.length ? h(Fragment, null,
        h(Eyebrow, { style: { marginTop: 8 } }, "Already answered"),
        decided.map(function (o) {
          var u = userOf(o.doerId);
          return h(Card, { key: o.id, variant: "flat", padding: "sm" },
            h("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
              h(Avatar, { name: u.name, size: "sm", verified: u.verified }),
              h("span", { style: { flex: 1, minWidth: 0, fontSize: "var(--text-sm)" } }, u.name),
              h("span", {
                style: { fontSize: "var(--text-2xs)", fontFamily: "var(--font-mono)", color: "var(--ink-400)" }
              }, formatMoney(o.amountMinor)),
              h(Badge, { size: "sm", tone: o.status === "accepted" ? "success" : "neutral" }, o.status)));
        })) : null),

    h(Dialog, {
      open: !!confirming, onClose: function () { setConfirming(null); },
      title: "Accept this offer",
      subtitle: confirming
        ? "Holds the money and shares your address with " + userOf(confirming.doerId).name
        : undefined,
      actions: h(Fragment, null,
        h(Button, { variant: "ghost", onClick: function () { setConfirming(null); } }, "Back"),
        h(Button, {
          variant: "money", fullWidth: true, icon: "check", disabled: short > 0,
          onClick: function () {
            var o = confirming;
            setConfirming(null);
            app.acceptOffer(o);
            props.onAccepted(quest.id);
          }
        }, "Hold and accept"))
    }, confirming ? h(Fragment, null,
      h(FeeBreakdown, {
        amountMinor: confirming.amountMinor,
        note: "We hold " + formatMoney(confirming.amountMinor) + " now. It reaches " +
          userOf(confirming.doerId).name + " when you confirm the quest is done, and comes back to you in full if it's cancelled."
      }),
      h(Card, { variant: "sunken", padding: "md" },
        h(InfoRow, { icon: "wallet", label: "In your wallet", value: formatMoney(available) }),
        h(InfoRow, {
          icon: "lock", label: "Held after this", last: true,
          value: formatMoney(app.held + confirming.amountMinor)
        })),
      short > 0 ? h(Card, { padding: "md", style: { borderColor: "var(--danger-500)" } },
        h("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } },
          h(Icon, { name: "alert-triangle", size: 17, color: "var(--danger-600)", style: { marginTop: 1 } }),
          h("span", { style: { fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" } },
            "Add " + formatMoney(short) + " to your wallet and you can hold this offer."))) : null,
      h("p", {
        style: { margin: 0, fontSize: "var(--text-2xs)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)" }
      }, "The other " + (pendingOffersFor(state, quest.id).length - 1) + " " +
        (pendingOffersFor(state, quest.id).length - 1 === 1 ? "offer is" : "offers are") +
        " declined automatically, and everyone is told.")) : null));
}

/* ---------------- My quests ----------------
   Every quest the viewer is on, whichever side they're on, with the one thing
   they can do next attached to it. Nothing here is a dead end. */

var MY_TABS = [
  { value: "active", label: "Active" },
  { value: "offers", label: "Offers" },
  { value: "done", label: "Done" }
];
function bucketOf(state, quest, actorId) {
  var role = roleOn(state, quest, actorId);
  if (role === "applicant") return "offers";
  /* Paid but unrated is not finished — the tab badge counts it, so the tab has
     to show it, or the badge is promising work the list hides. */
  if (quest.status === "paid" && (role === "poster" || role === "doer") && !myReviewOn(state, quest.id, actorId)) return "active";
  if (isClosed(quest.status)) return "done";
  return "active";
}

function EngagementCard(props) {
  var app = props.app, state = app.state, quest = props.quest;
  var role = roleOn(state, quest, app.actorId);
  var accepted = acceptedOfferFor(state, quest);
  var mine = myOfferOn(state, quest.id, app.actorId);
  var amount = accepted ? accepted.amountMinor : (mine ? mine.amountMinor : quest.payoutMinor);
  var counterpart = counterpartOf(state, quest, app.actorId);
  var pending = pendingOffersFor(state, quest.id);
  var track = statusMeta(quest.status).track;

  /* One primary action per card, chosen by role and state — the same decision
     the detail screen's slab makes, kept in one place so they cannot disagree. */
  function primary() {
    if (role === "poster" && quest.status === "open") {
      return { label: pending.length ? "Review " + pending.length + (pending.length === 1 ? " offer" : " offers") : "Review offers",
               icon: "users", variant: pending.length ? "primary" : "secondary",
               run: function () { props.onReviewOffers(quest.id); } };
    }
    if (role === "poster" && quest.status === "completed") {
      return { label: "Confirm and pay", icon: "check", variant: "money",
               run: function () { props.onConfirm(quest); } };
    }
    if (role === "doer" && quest.status === "assigned") {
      return { label: "Start quest", icon: "zap", variant: "primary",
               run: function () { app.startQuest(quest); } };
    }
    if (role === "doer" && quest.status === "in_progress") {
      return { label: "Mark as done", icon: "check", variant: "primary",
               run: function () { app.markDone(quest); } };
    }
    if (quest.status === "paid" && (role === "poster" || role === "doer") && !myReviewOn(state, quest.id, app.actorId)) {
      return { label: "Leave a rating", icon: "star", variant: "money",
               run: function () { props.onRate(quest.id); } };
    }
    return null;
  }
  var action = primary();

  return h(Card, { padding: "md", onClick: function () { props.onOpen(quest.id); } },
    h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
      h(Badge, { tone: role === "poster" ? "neutral" : "accent", size: "sm" },
        role === "poster" ? "Posted by you" : role === "doer" ? "Taken by you" : "Offer sent"),
      h(StatusBadge, { status: quest.status })),
    h("div", {
      style: {
        fontFamily: "var(--font-display)", fontSize: "var(--text-md)",
        fontWeight: "var(--weight-bold)", lineHeight: "var(--leading-snug)",
        letterSpacing: "var(--tracking-heading)", marginTop: 8
      }
    }, quest.title),
    h("div", { style: { display: "flex", alignItems: "center", gap: 10, marginTop: 8 } },
      h("div", {
        style: {
          flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 5,
          fontSize: "var(--text-2xs)", color: "var(--text-secondary)"
        }
      },
        h(Icon, { name: "calendar", size: 13, strokeWidth: 2 }),
        formatWhenAt(quest.scheduledFor, app.now)),
      h(RewardPill, { amount: formatMoney(amount), unit: null })),

    track >= 0 ? h("div", { style: { marginTop: 12 } }, h(StatusTrack, { current: track })) : null,

    quest.status === "completed" ? h("div", { style: { marginTop: 10 } },
      h(ConfirmWindow, { quest: quest, now: app.now, doerSide: role === "doer" })) : null,

    h("div", {
      style: {
        display: "flex", gap: 8, alignItems: "center", marginTop: 12, paddingTop: 10,
        borderTop: "var(--border-hair) solid var(--border-subtle)"
      }
    },
      counterpart
        ? h(UserChip, {
            name: counterpart.name, rating: counterpart.rating, quests: counterpart.questsCompleted,
            verified: counterpart.verified, size: "sm", style: { flex: 1, minWidth: 0 }
          })
        : h("span", {
            style: { flex: 1, minWidth: 0, fontSize: "var(--text-2xs)", color: "var(--text-secondary)" }
          }, quest.expiresAt && ms(quest.expiresAt) > app.now
              ? "Offers close in " + formatRemaining(quest.expiresAt, app.now)
              : pending.length ? "Offers have closed" : "No offers came in"),
      action ? h(Button, {
        size: "sm", variant: action.variant, icon: action.icon,
        onClick: function (ev) { ev.stopPropagation(); action.run(); }
      }, action.label) : null));
}

function MyQuestsScreen(props) {
  var app = props.app, state = app.state;
  var tb = React.useState(props.initialTab || "active");
  var tab = tb[0], setTab = tb[1];
  var all = engagementsFor(state, app.actorId);
  var counts = { active: 0, offers: 0, done: 0 };
  all.forEach(function (q) { counts[bucketOf(state, q, app.actorId)] += 1; });
  var list = all.filter(function (q) { return bucketOf(state, q, app.actorId) === tab; });

  var EMPTY = {
    active: { title: "Nothing on the go — take a quest and it lands here.", action: "Browse quests" },
    offers: { title: "No offers out right now. Find one you fancy and name your price.", action: "Browse quests" },
    done: { title: "Nothing finished yet — your first completed quest shows up here.", action: "Browse quests" }
  };

  return h("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
    h(TopBar, {
      title: "My quests",
      actions: h(IconButton, {
        icon: "bell", label: "Notifications", size: "sm",
        badge: app.unreadNotes || undefined, onClick: props.onNotifications
      })
    }),
    h("div", { style: { padding: "14px var(--gutter-screen) 0", flex: "none" } },
      h(Tabs, {
        value: tab, onChange: setTab,
        items: MY_TABS.map(function (t) {
          return { value: t.value, label: t.label, count: counts[t.value] };
        })
      })),
    h(Body, { style: { paddingTop: 12, gap: 10 } },
      list.length === 0
        ? h(EmptyState, { title: EMPTY[tab].title, action: EMPTY[tab].action, onAction: props.onBrowse })
        : list.map(function (q) {
            return h(EngagementCard, {
              key: q.id, quest: q, app: app,
              onOpen: props.onOpen, onReviewOffers: props.onReviewOffers,
              onRate: props.onRate, onConfirm: props.onConfirm
            });
          })));
}

/* ---------------- Chats ----------------
   One thread per (quest, doer), never shared. Which side of it you are on is
   a function of the actor, so flipping identity re-renders the same thread
   from the other chair. */

function ThreadScreen(props) {
  var app = props.app, state = app.state, thread = props.thread;
  var quest = questById(state, thread.questId);
  var other = otherSideOf(thread, app.actorId);
  var msgs = state.messages[thread.id] || [];
  var dr = React.useState("");
  var draft = dr[0], setDraft = dr[1];
  var scroller = React.useRef(null);
  var closed = quest ? isClosed(quest.status) : false;
  var role = quest ? roleOn(state, quest, app.actorId) : "visitor";
  var offer = quest ? myOfferOn(state, quest.id, thread.doerId) : null;
  var addressShown = quest ? addressVisibleTo(state, quest, app.actorId) : false;

  React.useEffect(function () { app.markThreadRead(thread); }, [thread.id, msgs.length]);
  React.useEffect(function () {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs.length, thread.id]);

  return h("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
    h(TopBar, {
      title: other.name, subtitle: quest ? quest.title : undefined, onBack: props.onBack,
      actions: h(IconButton, {
        icon: "chevron-right", label: "Open the quest", size: "sm",
        onClick: function () { if (quest) props.onOpenQuest(quest.id); }
      })
    }),
    quest ? h(Card, {
      variant: "flat", padding: "sm",
      style: { borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none", flex: "none" }
    },
      h("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
        statusMeta(quest.status).track >= 0
          ? h(StatusTrack, { current: statusMeta(quest.status).track, style: { flex: 1 } })
          : h("span", { style: { flex: 1 } }, h(StatusBadge, { status: quest.status })),
        h(RewardPill, {
          amount: formatMoney(offer ? offer.amountMinor : quest.payoutMinor),
          unit: null, tone: "quiet"
        }))) : null,

    h("div", {
      ref: scroller, className: "screen-body",
      style: {
        flex: 1, minHeight: 0, overflowY: "auto",
        padding: "16px var(--gutter-screen)", display: "flex", flexDirection: "column", gap: 10
      }
    },
      /* The address arrives in the thread, because that is where the two of
         them are actually talking. */
      addressShown && quest && quest.status !== "open" ? h(Card, { variant: "accent", padding: "sm" },
        h("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } },
          h(Icon, { name: "map-pin", size: 16, strokeWidth: 2, style: { marginTop: 2 } }),
          h("div", { style: { flex: 1, minWidth: 0 } },
            h("div", { style: { fontSize: "var(--text-2xs)", fontWeight: "var(--weight-bold)" } }, "Exact address"),
            h("div", { style: { fontSize: "var(--text-sm)", marginTop: 2 } }, quest.addressLine)))) : null,

      msgs.map(function (m) {
        var mineMsg = m.senderId === app.actorId;
        return h("div", {
          key: m.id,
          style: { display: "flex", justifyContent: mineMsg ? "flex-end" : "flex-start", gap: 8 }
        },
          mineMsg ? null : h(Avatar, { name: other.name, size: "sm" }),
          h("div", {
            style: {
              maxWidth: "76%", padding: "10px 13px",
              background: mineMsg ? "var(--lime-500)" : "var(--paper-000)",
              border: "var(--border-width) solid var(--border-strong)",
              borderRadius: mineMsg ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
              boxShadow: "var(--shadow-sticker-sm)"
            }
          },
            h("div", { style: { fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" } }, m.body),
            h("div", {
              style: {
                fontSize: 10, fontFamily: "var(--font-mono)", opacity: 0.55,
                marginTop: 3, textAlign: "right"
              }
            }, formatStamp(m.at, app.now))));
      })),

    closed
      ? h("div", {
          style: {
            padding: "12px var(--gutter-screen)", background: "var(--surface-sunken)",
            borderTop: "var(--border-width) solid var(--border-strong)", flex: "none",
            display: "flex", alignItems: "center", gap: 8
          }
        },
          h(Icon, { name: "lock", size: 15, color: "var(--ink-500)" }),
          h("span", { style: { fontSize: "var(--text-2xs)", color: "var(--text-secondary)", flex: 1 } },
            "This quest is " + statusMeta(quest.status).label.toLowerCase() + ", so the thread is read-only. It stays here for the record."))
      : h("div", {
          style: {
            padding: "10px var(--gutter-screen)", background: "var(--paper-000)",
            borderTop: "var(--border-width) solid var(--border-strong)",
            display: "flex", gap: 8, alignItems: "center", flex: "none"
          }
        },
          h(Input, {
            placeholder: "Message", value: draft,
            onChange: function (ev) { setDraft(ev.target.value); },
            onKeyDown: function (ev) {
              if (ev.key === "Enter" && !ev.shiftKey) {
                ev.preventDefault();
                app.sendMessage(thread, draft);
                setDraft("");
              }
            }
          }),
          h(IconButton, {
            icon: "send", label: "Send", variant: "primary",
            disabled: !draft.trim(),
            onClick: function () { app.sendMessage(thread, draft); setDraft(""); }
          })));
}

function ChatsScreen(props) {
  var app = props.app, state = app.state;
  var list = threadsFor(state, app.actorId);
  return h("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
    h(TopBar, {
      title: "Chats",
      actions: h(IconButton, {
        icon: "bell", label: "Notifications", size: "sm",
        badge: app.unreadNotes || undefined, onClick: props.onNotifications
      })
    }),
    h(Body, { style: { paddingTop: 14, gap: 10 } },
      list.length === 0
        ? h(EmptyState, {
            title: "No conversations yet — take a quest and the chat opens itself.",
            action: "Browse quests", onAction: props.onBrowse
          })
        : list.map(function (t) {
            var other = otherSideOf(t, app.actorId);
            var quest = questById(state, t.questId);
            var msgs = state.messages[t.id] || [];
            var last = msgs[msgs.length - 1];
            var unread = unreadIn(state, t, app.actorId);
            return h(Card, {
              key: t.id, padding: "sm",
              onClick: function () { props.onOpen(t); }
            },
              h("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
                h(UserChip, {
                  name: other.name, rating: other.rating, quests: other.questsCompleted,
                  verified: other.verified, size: "md", style: { flex: 1, minWidth: 0 }
                }),
                h("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 } },
                  h("span", {
                    style: { fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-400)" }
                  }, formatStamp(t.lastMessageAt, app.now)),
                  unread ? h(Badge, { tone: "hot", size: "sm" }, unread + " new") : null)),
              h("div", {
                style: { paddingTop: 8, borderTop: "var(--border-hair) solid var(--border-subtle)" }
              },
                h("div", {
                  style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }
                },
                  h("span", {
                    style: {
                      flex: 1, minWidth: 0, fontSize: "var(--text-xs)", color: "var(--text-muted)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }
                  }, quest ? quest.title : "Quest removed"),
                  quest ? h(StatusBadge, { status: quest.status }) : null),
                h("div", {
                  style: {
                    fontSize: "var(--text-sm)",
                    fontWeight: unread ? "var(--weight-semibold)" : "var(--weight-regular)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }
                }, last
                  ? (last.senderId === app.actorId ? "You: " : "") + last.body
                  : "Offer sent — waiting to hear back")));
          })));
}

/* ---------------- Wallet reading ----------------
   The ledger is double-entry; a person is not. These group the raw entries by
   transaction and report what actually happened to the viewer's money, which
   is the only honest way to show a derived balance. */

function walletRowsFor(state, userId) {
  var byTxn = {};
  var order = [];
  state.ledger.forEach(function (e) {
    if (e.userId !== userId) return;
    if (!byTxn[e.txnId]) {
      byTxn[e.txnId] = { txnId: e.txnId, at: e.at, memo: e.memo, questId: e.questId, available: 0, held: 0, bank: 0 };
      order.push(e.txnId);
    }
    var row = byTxn[e.txnId];
    if (e.account === "user_available") row.available += e.amountMinor;
    if (e.account === "user_held") row.held += e.amountMinor;
    if (e.account === "external_bank") row.bank += e.amountMinor;
  });
  return order.map(function (id) { return byTxn[id]; })
    .sort(function (a, b) { return ms(b.at) - ms(a.at); });
}
function walletRowFace(row) {
  if (row.held > 0) return { amount: row.held, word: "Held", tone: "warning" };
  if (row.held < 0 && row.available === 0) return { amount: row.held, word: "Released", tone: "success" };
  if (row.available > 0) return { amount: row.available, word: /refund/i.test(row.memo) ? "Refunded" : "Paid in", tone: "success" };
  return { amount: row.available, word: /cash out/i.test(row.memo) ? "Sent" : "Out", tone: "neutral" };
}

/* PRD §7.9. Payment notifications are transactional and cannot be turned off,
   which the row states rather than silently enforcing. */
var NOTIFICATION_CATEGORIES = [
  { key: "offers", label: "Offers", description: "Someone offers on your quest, or answers yours" },
  { key: "messages", label: "Messages", description: "A new message in a thread you're in" },
  { key: "reminders", label: "Reminders", description: "A quest is starting soon, or a window is closing" },
  { key: "payments", label: "Payments", description: "Money held, released or refunded", locked: true }
];

/* ---------------- Profile & wallet ---------------- */

function ProfileScreen(props) {
  var app = props.app, state = app.state;
  var me = app.me();
  var cs = React.useState(false);
  var cashSheet = cs[0], setCashSheet = cs[1];
  var se = React.useState(false);
  var settings = se[0], setSettings = se[1];
  var am = React.useState("");
  var amount = am[0], setAmount = am[1];
  var nf = React.useState({ offers: true, messages: true, reminders: true, payments: true });
  var notifPrefs = nf[0], setNotifPrefs = nf[1];

  var rows = walletRowsFor(state, app.actorId);
  var saved = savedFor(state, app.actorId);
  var mine = reviewsOf(state, app.actorId).filter(function (r) { return reviewVisible(state, r, app.now); });
  var cashMinor = Math.max(0, Math.round(parseFloat(amount || "0") * 100));
  var canCash = cashMinor > 0 && cashMinor <= app.available;
  var doneCount = state.quests.filter(function (q) {
    return q.status === "paid" && roleOn(state, q, app.actorId) !== "visitor";
  }).length;

  React.useEffect(function () {
    if (cashSheet) setAmount(String(Math.floor(app.available / 100)));
  }, [cashSheet]);

  return h("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
    h(TopBar, {
      title: "Profile",
      actions: h(IconButton, {
        icon: "sliders-horizontal", label: "Settings", size: "sm",
        onClick: function () { setSettings(true); }
      })
    }),
    h(Body, null,
      h(Card, { padding: "lg" },
        h("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
          h(Avatar, { name: me.name, size: "lg", verified: me.verified }),
          h("div", { style: { flex: 1, minWidth: 0 } },
            h("div", {
              style: {
                font: "var(--weight-black) var(--text-xl)/1.15 var(--font-display)",
                letterSpacing: "var(--tracking-heading)"
              }
            }, me.name),
            h("div", {
              style: { fontSize: "var(--text-2xs)", color: "var(--text-secondary)", marginTop: 2 }
            }, me.area + " · joined " + formatStamp(me.joined, app.now)))),
        me.bio ? h("p", {
          style: {
            margin: "12px 0 0", fontSize: "var(--text-sm)",
            lineHeight: "var(--leading-normal)", color: "var(--ink-700)"
          }
        }, me.bio) : null,
        /* Trust language is factual — numbers, not reassurance. */
        h("div", {
          style: {
            display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, paddingTop: 12,
            borderTop: "var(--border-hair) solid var(--border-subtle)"
          }
        },
          me.verified ? h(Badge, { tone: "success", icon: "shield-check", size: "sm" }, "ID verified") : null,
          h(Badge, { tone: "money", icon: "star", size: "sm" }, me.rating.toFixed(1)),
          h(Badge, { size: "sm" }, me.questsCompleted + " quests"),
          h(Badge, { size: "sm" }, Math.round(me.cancelRate * 100) + "% cancelled"))),

      h(Card, { variant: "money", padding: "lg" },
        h(Eyebrow, { style: { color: "var(--ink-700)" } }, "Wallet"),
        h("div", {
          style: {
            font: "var(--weight-black) var(--type-display-size)/var(--leading-tight) var(--font-display)",
            letterSpacing: "var(--tracking-display)", fontFeatureSettings: '"tnum" 1', marginTop: 4
          }
        }, formatMoney(app.available)),
        h("div", { style: { fontSize: "var(--text-2xs)", marginTop: 2 } }, "Available to spend or cash out"),
        h("div", {
          style: {
            display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, paddingTop: 12,
            borderTop: "var(--border-hair) solid var(--ink-900)"
          }
        },
          app.held ? h(Badge, { tone: "warning", icon: "lock", size: "sm" }, formatMoney(app.held) + " held") : null,
          app.incoming ? h(Badge, { tone: "success", icon: "coins", size: "sm" }, formatMoney(app.incoming) + " coming") : null,
          !app.held && !app.incoming ? h(Badge, { size: "sm" }, "Nothing held") : null),
        h(Button, {
          variant: "inverse", size: "md", icon: "wallet", fullWidth: true,
          style: { marginTop: 12 }, disabled: app.available <= 0,
          onClick: function () { setCashSheet(true); }
        }, "Cash out")),

      h(Card, { padding: "md", onClick: props.onSaved },
        h("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
          h(Icon, { name: "heart", size: 18, color: "var(--flare-500)", filled: saved.length > 0 }),
          h("span", { style: { flex: 1, fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" } }, "Saved quests"),
          h(Badge, { size: "sm" }, String(saved.length)),
          h(Icon, { name: "chevron-right", size: 17, color: "var(--ink-400)" }))),

      h(Eyebrow, { style: { marginTop: 4 } }, "Money in and out"),
      rows.length === 0
        ? h(EmptyState, {
            title: "No activity yet — your first payout lands here.",
            action: "Find a quest", onAction: props.onBrowse
          })
        : rows.slice(0, 12).map(function (row) {
            var face = walletRowFace(row);
            var quest = row.questId ? questById(state, row.questId) : null;
            return h(Card, { key: row.txnId, variant: "flat", padding: "sm" },
              h("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
                h("div", { style: { flex: 1, minWidth: 0 } },
                  h("div", {
                    style: {
                      fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }
                  }, quest ? quest.title : row.memo),
                  h("div", {
                    style: { fontSize: "var(--text-2xs)", color: "var(--text-secondary)", marginTop: 2 }
                  }, formatStamp(row.at, app.now) + (quest ? " · " + row.memo : ""))),
                h("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 } },
                  h("span", {
                    style: {
                      font: "var(--weight-black) var(--text-md)/1 var(--font-display)",
                      fontFeatureSettings: '"tnum" 1',
                      color: face.amount > 0 ? "var(--success-600)" : "var(--ink-900)"
                    }
                  }, (face.amount > 0 ? "+" : "") + formatMoney(face.amount)),
                  h(Badge, { tone: face.tone, size: "sm" }, face.word))));
          }),

      mine.length ? h(Fragment, null,
        h(Eyebrow, { style: { marginTop: 4 } }, "What people said"),
        mine.map(function (r) {
          var rater = userOf(r.raterId);
          return h(Card, { key: r.id, variant: "sunken", padding: "md" },
            h("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
              h(Avatar, { name: rater.name, size: "sm" }),
              h("span", { style: { flex: 1, fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" } }, rater.name),
              h(Badge, { tone: "money", icon: "star", size: "sm" }, String(r.rating))),
            r.comment ? h("p", {
              style: {
                margin: "8px 0 0", fontSize: "var(--text-sm)",
                lineHeight: "var(--leading-normal)", color: "var(--ink-700)"
              }
            }, r.comment) : null);
        })) : null),

    h(Dialog, {
      open: cashSheet, onClose: function () { setCashSheet(false); },
      title: "Cash out",
      subtitle: "Into " + me.bank + ", usually next working day",
      actions: h(Fragment, null,
        h(Button, { variant: "ghost", onClick: function () { setCashSheet(false); } }, "Cancel"),
        h(Button, {
          variant: "money", fullWidth: true, disabled: !canCash,
          onClick: function () { setCashSheet(false); app.cashOut(cashMinor); }
        }, "Cash out"))
    },
      h(Input, {
        label: "How much?", prefix: "NT$", value: amount,
        onChange: function (ev) { setAmount(ev.target.value.replace(/[^0-9.]/g, "")); },
        hint: canCash || !amount ? "You have " + formatMoney(app.available) + " available"
          : "You have " + formatMoney(app.available) + " — try that or less",
        error: amount && !canCash ? "That's more than you have available" : undefined
      }),
      h(Card, { variant: "sunken", padding: "md" },
        h(InfoRow, { icon: "credit-card", label: "To", value: me.bank }),
        h(InfoRow, { icon: "wallet", label: "Left after this", last: true, value: formatMoney(Math.max(0, app.available - cashMinor)) }))),

    h(Dialog, {
      open: settings, onClose: function () { setSettings(false); },
      title: "Settings",
      actions: h(Button, { fullWidth: true, onClick: function () { setSettings(false); } }, "Done")
    },
      h(Eyebrow, null, "Notifications"),
      NOTIFICATION_CATEGORIES.map(function (c) {
        return h(Switch, {
          key: c.key, label: c.label,
          description: c.locked ? c.description + " — always on" : c.description,
          checked: c.locked ? true : notifPrefs[c.key],
          disabled: !!c.locked,
          onChange: function () {
            if (c.locked) return;
            var next = Object.assign({}, notifPrefs);
            next[c.key] = !next[c.key];
            setNotifPrefs(next);
          }
        });
      }),
      h(Eyebrow, { style: { marginTop: 8 } }, "You"),
      h(Card, { variant: "sunken", padding: "md" },
        h(InfoRow, { icon: "user", label: "Name", value: me.name }),
        h(InfoRow, { icon: "message-square", label: "Phone", value: me.phone }),
        h(InfoRow, { icon: "send", label: "Email", value: me.email }),
        h(InfoRow, { icon: "map-pin", label: "Area", value: me.area }),
        h(InfoRow, {
          icon: "shield-check", label: "Verification", last: true,
          value: me.verified ? "ID verified" : "Not verified yet"
        })),
      h(Button, { variant: "secondary", fullWidth: true, icon: "trash" }, "Delete account"),
      h("p", {
        style: { margin: 0, fontSize: "var(--text-2xs)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)" }
      }, "Deleting your account anonymises the quests you were part of. The other side keeps their record of them.")));
}

/* ---------------- Saved ---------------- */

function SavedScreen(props) {
  var app = props.app, state = app.state;
  var ids = savedFor(state, app.actorId);
  var list = ids.map(function (id) { return questById(state, id); }).filter(Boolean);
  return h("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
    h(TopBar, { title: "Saved quests", onBack: props.onBack }),
    h(Body, null,
      list.length === 0
        ? h(EmptyState, {
            title: "Nothing saved yet — tap the heart on a quest and it waits here.",
            action: "Browse quests", onAction: props.onBrowse
          })
        : list.map(function (x) {
            var u = userOf(x.posterId);
            var gone = x.status !== "open";
            return h(QuestCard, {
              key: x.id, variant: "spacious", title: x.title,
              payout: formatMoney(x.payoutMinor),
              distance: formatDistance(app.distanceTo(x)),
              duration: formatDuration(x.estimatedMinutes),
              when: formatWhenAt(x.scheduledFor, app.now),
              badges: gone
                ? [{ label: statusMeta(x.status).label, tone: statusMeta(x.status).tone }]
                : questBadges(x, app.now),
              poster: posterProp(u), saved: true,
              onSave: function () { app.toggleSave(x.id); },
              onClick: function () { props.onOpen(x.id); }
            });
          })));
}

/* ---------------- Notification inbox ---------------- */

var NOTIFICATION_ICON = {
  offer_received: "user", offer_accepted: "check-circle", offer_declined: "x",
  message: "message-circle", quest_started: "zap", quest_done: "check",
  payment: "coins", quest_cancelled: "x", quest_expired: "clock", quest_disputed: "flag"
};
function NotificationsScreen(props) {
  var app = props.app, state = app.state;
  var list = notificationsFor(state, app.actorId);
  React.useEffect(function () { app.readAllNotifications(); }, []);
  return h("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
    h(TopBar, { title: "Notifications", onBack: props.onBack }),
    h(Body, { style: { gap: 10 } },
      list.length === 0
        ? h(EmptyState, {
            title: "Nothing yet — offers, messages and payments land here.",
            action: "Browse quests", onAction: props.onBrowse
          })
        : list.map(function (n) {
            return h(Card, {
              key: n.id, padding: "sm",
              variant: n.readAt ? "flat" : "sticker",
              onClick: n.questId ? function () { props.onOpen(n.questId); } : undefined
            },
              h("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" } },
                h("span", {
                  style: {
                    display: "grid", placeItems: "center", width: 32, height: 32, flex: "none",
                    background: n.readAt ? "var(--surface-sunken)" : "var(--lime-500)",
                    border: "var(--border-width) solid var(--border-strong)",
                    borderRadius: "var(--radius-pill)"
                  }
                }, h(Icon, { name: NOTIFICATION_ICON[n.type] || "bell", size: 15, strokeWidth: 2 })),
                h("div", { style: { flex: 1, minWidth: 0 } },
                  h("div", {
                    style: {
                      fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)",
                      fontWeight: n.readAt ? "var(--weight-regular)" : "var(--weight-semibold)"
                    }
                  }, n.body),
                  h("div", {
                    style: { fontSize: "var(--text-2xs)", color: "var(--text-muted)", marginTop: 3 }
                  }, formatStamp(n.at, app.now)))));
          })));
}

/* ---------------- Someone else's profile ---------------- */

var REPORT_REASONS = [
  "They didn't turn up",
  "They asked me to pay outside the app",
  "The quest wasn't what was described",
  "They were rude or threatening",
  "Something else"
];
function PublicProfileScreen(props) {
  var app = props.app, state = app.state;
  var u = userOf(props.userId);
  var rp = React.useState(false);
  var reportSheet = rp[0], setReportSheet = rp[1];
  var rr = React.useState(REPORT_REASONS[0]);
  var reason = rr[0], setReason = rr[1];
  var list = reviewsOf(state, props.userId).filter(function (r) { return reviewVisible(state, r, app.now); });
  var open = state.quests.filter(function (q) { return q.posterId === props.userId && q.status === "open"; });

  return h("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
    h(TopBar, {
      title: u.name, onBack: props.onBack,
      actions: h(IconButton, {
        icon: "flag", label: "Report this person", size: "sm",
        onClick: function () { setReportSheet(true); }
      })
    }),
    h(Body, null,
      h(Card, { padding: "lg" },
        h("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
          h(Avatar, { name: u.name, size: "lg", verified: u.verified }),
          h("div", { style: { flex: 1, minWidth: 0 } },
            h("div", {
              style: {
                font: "var(--weight-black) var(--text-xl)/1.15 var(--font-display)",
                letterSpacing: "var(--tracking-heading)"
              }
            }, u.name),
            h("div", {
              style: { fontSize: "var(--text-2xs)", color: "var(--text-secondary)", marginTop: 2 }
            }, u.area + " · joined " + formatStamp(u.joined, app.now)))),
        u.bio ? h("p", {
          style: {
            margin: "12px 0 0", fontSize: "var(--text-sm)",
            lineHeight: "var(--leading-normal)", color: "var(--ink-700)"
          }
        }, u.bio) : null,
        h("div", {
          style: {
            display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, paddingTop: 12,
            borderTop: "var(--border-hair) solid var(--border-subtle)"
          }
        },
          u.verified ? h(Badge, { tone: "success", icon: "shield-check", size: "sm" }, "ID verified") : null,
          h(Badge, { tone: "money", icon: "star", size: "sm" }, u.rating.toFixed(1)),
          h(Badge, { size: "sm" }, u.questsCompleted + " quests"),
          h(Badge, { size: "sm" }, Math.round(u.cancelRate * 100) + "% cancelled"))),

      open.length ? h(Fragment, null,
        h(Eyebrow, null, "Open quests"),
        open.map(function (x) {
          return h(QuestCard, {
            key: x.id, variant: "compact", title: x.title,
            payout: formatMoney(x.payoutMinor),
            distance: formatDistance(app.distanceTo(x)),
            duration: formatDuration(x.estimatedMinutes),
            when: formatWhenAt(x.scheduledFor, app.now),
            onClick: function () { props.onOpenQuest(x.id); }
          });
        })) : null,

      h(Eyebrow, { style: { marginTop: 4 } }, "What people said"),
      list.length === 0
        ? h(Card, { variant: "sunken", padding: "md" },
            h("span", { style: { fontSize: "var(--text-sm)", color: "var(--text-secondary)" } },
              "No ratings showing yet. They appear once both sides have rated, or after 14 days."))
        : list.map(function (r) {
            var rater = userOf(r.raterId);
            return h(Card, { key: r.id, variant: "sunken", padding: "md" },
              h("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                h(Avatar, { name: rater.name, size: "sm" }),
                h("span", { style: { flex: 1, fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" } }, rater.name),
                h(Badge, { tone: "money", icon: "star", size: "sm" }, String(r.rating))),
              r.comment ? h("p", {
                style: {
                  margin: "8px 0 0", fontSize: "var(--text-sm)",
                  lineHeight: "var(--leading-normal)", color: "var(--ink-700)"
                }
              }, r.comment) : null);
          })),

    h(Dialog, {
      open: reportSheet, onClose: function () { setReportSheet(false); },
      title: "Report " + u.name,
      subtitle: "Only we see this — they aren't told you reported them",
      actions: h(Fragment, null,
        h(Button, { variant: "ghost", onClick: function () { setReportSheet(false); } }, "Cancel"),
        h(Button, {
          variant: "danger", fullWidth: true,
          onClick: function () {
            setReportSheet(false);
            app.flash("neutral", "Reported — we'll look at it within a day");
          }
        }, "Send report"))
    },
      h(Eyebrow, null, "What happened?"),
      REPORT_REASONS.map(function (x) {
        return h(Radio, {
          key: x, name: "report-reason", label: x,
          checked: reason === x, onChange: function () { setReason(x); }
        });
      }),
      h(Button, { variant: "secondary", fullWidth: true, icon: "eye" }, "Block this person")));
}

/* ---------------- The prototype shell ---------------- */

/* Anything the viewer could act on right now, counted for the tab badge. The
   same predicate the cards use to pick their primary action, so the badge can
   never promise something the screen doesn't offer. */
function actionableCount(state, actorId) {
  return state.quests.reduce(function (n, q) {
    var role = roleOn(state, q, actorId);
    if (role === "poster" && q.status === "open" && pendingOffersFor(state, q.id).length) return n + 1;
    if (role === "poster" && q.status === "completed") return n + 1;
    if (role === "doer" && (q.status === "assigned" || q.status === "in_progress")) return n + 1;
    if (q.status === "paid" && (role === "poster" || role === "doer") && !myReviewOn(state, q.id, actorId)) return n + 1;
    return n;
  }, 0);
}

/* The actor switcher and the clock. ADR-008: two-sided software cannot be
   reviewed from one chair, and a 72-hour window cannot be reviewed at all
   without being able to reach the far side of it. Dev-only, outside the
   phone frame, so it is never mistaken for product. */
var CLOCK_JUMPS = [
  { label: "+1 hr", delta: HOUR_MS, said: "forward an hour" },
  { label: "+1 day", delta: 24 * HOUR_MS, said: "forward a day" },
  { label: "+3 days", delta: 3 * 24 * HOUR_MS, said: "forward three days" }
];
function PreviewRail(props) {
  var app = props.app;
  var ids = Object.keys(D.users);
  var me = app.me();
  return h("div", {
    style: {
      width: "100%", maxWidth: "var(--app-frame-width)",
      display: "flex", flexDirection: "column", gap: 10,
      padding: "12px 14px", background: "var(--paper-000)",
      border: "var(--stroke-ink)", borderRadius: "var(--radius-card)",
      boxShadow: "var(--shadow-sticker)"
    }
  },
    h("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
      h(Eyebrow, { style: { flex: 1 } }, "Viewing as"),
      h("span", {
        style: { fontSize: "var(--text-3xs)", fontFamily: "var(--font-mono)", color: "var(--ink-400)" }
      }, "preview only")),
    h("div", {
      style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, minWidth: 0 }
    }, ids.map(function (id) {
      var u = D.users[id];
      return h(Tag, {
        key: id, size: "sm", selected: app.actorId === id,
        onSelect: function () { app.switchActor(id); }
      }, u.name);
    })),
    h("div", {
      style: {
        display: "flex", alignItems: "center", gap: 8,
        paddingTop: 10, borderTop: "var(--border-hair) solid var(--border-subtle)"
      }
    },
      h(Icon, { name: "clock", size: 15, color: "var(--ink-500)", style: { flex: "none" } }),
      h("span", {
        style: {
          flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap", fontSize: "var(--text-2xs)",
          fontFamily: "var(--font-mono)", color: "var(--ink-500)"
        }
      }, formatWhenAt(isoAt(app.now), app.now)),
      h("div", { style: { display: "flex", gap: 6, flex: "none" } },
        CLOCK_JUMPS.map(function (j) {
          return h(Button, {
            key: j.label, size: "sm", variant: "secondary",
            onClick: function () { app.advanceClock(j.delta, j.said); }
          }, j.label);
        }))),
    h("p", {
      style: {
        margin: 0, fontSize: "var(--text-3xs)", lineHeight: "var(--leading-normal)",
        color: "var(--text-secondary)"
      }
    }, "Switching actor re-renders the same records from the other side. Moving the clock expires open quests and auto-releases anything past its 72-hour confirm window — " + me.name + " sees the result either way."));
}

function Prototype() {
  var app = useApp();
  var state = app.state;
  var tb = React.useState("browse");
  var tab = tb[0], setTab = tb[1];
  var sk = React.useState([]);
  var stack = sk[0], setStack = sk[1];
  var mq = React.useState("active");
  var myTab = mq[0], setMyTab = mq[1];
  var rate = React.useState(null);
  var rateFor = rate[0], setRateFor = rate[1];

  function push(x) { setStack(stack.concat([x])); }
  function pop() { setStack(stack.slice(0, -1)); }
  function reset(t) { setStack([]); setTab(t); }
  function openQuest(id) { push({ k: "quest", id: id }); }
  function openThread(t) { if (t) push({ k: "thread", id: t.id }); }
  function openUser(id) { push({ k: "user", id: id }); }

  var top = stack.length ? stack[stack.length - 1] : null;
  var screen = null;

  if (top && top.k === "quest") {
    var quest = questById(state, top.id);
    screen = quest ? h(QuestDetailScreen, {
      key: quest.id, quest: quest, app: app, onBack: pop,
      onOpenThread: openThread, onOpenProfile: openUser,
      onReviewOffers: function (id) { push({ k: "offers", id: id }); },
      onOffered: function () { pop(); reset("chats"); },
      onRate: function () {}
    }) : null;
  } else if (top && top.k === "offers") {
    var oq = questById(state, top.id);
    screen = oq ? h(OfferInboxScreen, {
      key: oq.id, quest: oq, app: app, onBack: pop, onOpenThread: openThread,
      onAccepted: function () { pop(); }
    }) : null;
  } else if (top && top.k === "thread") {
    var th = null;
    for (var i = 0; i < state.threads.length; i++) if (state.threads[i].id === top.id) th = state.threads[i];
    screen = th ? h(ThreadScreen, {
      key: th.id, thread: th, app: app, onBack: pop, onOpenQuest: openQuest
    }) : null;
  } else if (top && top.k === "notifications") {
    screen = h(NotificationsScreen, {
      app: app, onBack: pop, onOpen: openQuest,
      onBrowse: function () { reset("browse"); }
    });
  } else if (top && top.k === "saved") {
    screen = h(SavedScreen, {
      app: app, onBack: pop, onOpen: openQuest,
      onBrowse: function () { reset("browse"); }
    });
  } else if (top && top.k === "user") {
    screen = h(PublicProfileScreen, {
      key: top.id, userId: top.id, app: app, onBack: pop, onOpenQuest: openQuest
    });
  } else if (tab === "browse") {
    screen = h(BrowseScreen, {
      app: app, onOpen: openQuest,
      onNotifications: function () { push({ k: "notifications" }); }
    });
  } else if (tab === "quests") {
    screen = h(MyQuestsScreen, {
      app: app, initialTab: myTab, onOpen: openQuest,
      onReviewOffers: function (id) { push({ k: "offers", id: id }); },
      onRate: function (id) { setRateFor(id); },
      /* Paying and rating are one moment, so confirming opens the rating
         rather than leaving it for a tab the poster may never come back to. */
      onConfirm: function (quest) { app.confirmDone(quest); setRateFor(quest.id); },
      onBrowse: function () { reset("browse"); },
      onNotifications: function () { push({ k: "notifications" }); }
    });
  } else if (tab === "post") {
    screen = h(PostQuestScreen, {
      app: app,
      onPosted: function (id) { setMyTab("active"); reset("quests"); }
    });
  } else if (tab === "chats") {
    screen = h(ChatsScreen, {
      app: app, onOpen: openThread,
      onBrowse: function () { reset("browse"); },
      onNotifications: function () { push({ k: "notifications" }); }
    });
  } else {
    screen = h(ProfileScreen, {
      app: app,
      onSaved: function () { push({ k: "saved" }); },
      onBrowse: function () { reset("browse"); }
    });
  }

  var actionable = actionableCount(state, app.actorId);
  var tabs = [
    { value: "browse", label: "Browse", icon: "search" },
    { value: "quests", label: "My quests", icon: "list-checks", badge: actionable || undefined },
    { value: "post", label: "Post", icon: "plus" },
    { value: "chats", label: "Chats", icon: "message-circle", badge: app.unread || undefined },
    { value: "profile", label: "Profile", icon: "user" }
  ];
  var rateQuest = rateFor ? questById(state, rateFor) : null;

  return h("div", {
    style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }
  },
    h(PreviewRail, { app: app }),
    h("div", { className: "frame" },
      h("div", { style: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } }, screen),
      app.toast ? h("div", { className: "toasts" },
        h(Toast, { key: app.toast.key, tone: app.toast.tone }, app.toast.text)) : null,
      h(TabBar, {
        items: tabs, value: stack.length ? null : tab,
        onChange: function (v) { reset(v); }
      }),
      rateQuest ? h(RateSheet, {
        open: true, counterpart: counterpartOf(state, rateQuest, app.actorId),
        onClose: function () { setRateFor(null); },
        onConfirm: function (rating, comment) {
          setRateFor(null);
          app.submitReview(rateQuest, rating, comment);
        }
      }) : null));
}
/* ==== 03-galleries.jsx ==== */
/* YouDO M0 preview — galleries and page shell. */

/* Token values are read from the live CSS custom properties, so what's shown
   here is whatever tokens/*.css actually declares — never a re-typed copy. */
/* The tab bar specimen. The live shell builds its own list because the badges
   are counts of real work waiting; this is the static one to look at. */
var TABS = [
  { value: "browse", label: "Browse", icon: "search" },
  { value: "quests", label: "My quests", icon: "list-checks", badge: 2 },
  { value: "post", label: "Post", icon: "plus" },
  { value: "chats", label: "Chats", icon: "message-circle", badge: 3 },
  { value: "profile", label: "Profile", icon: "user" }
];

function tok(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function Spec(props) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, props.label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: props.align || "center"
    }
  }, props.children));
}
function Panel(props) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18,
      padding: "20px",
      background: "var(--paper-000)",
      border: "var(--stroke-ink)",
      borderRadius: "var(--radius-card)",
      boxShadow: "var(--shadow-sticker)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: "var(--weight-bold) var(--text-xl)/1.1 var(--font-display)",
      letterSpacing: "var(--tracking-heading)"
    }
  }, props.title), props.children);
}

/* ---------------- Components ---------------- */

function ComponentsTab() {
  var a = React.useState(false);
  var dlg = a[0],
    setDlg = a[1];
  var b = React.useState(true);
  var ck = b[0],
    setCk = b[1];
  var c = React.useState("fixed");
  var rd = c[0],
    setRd = c[1];
  var e = React.useState(true);
  var sw = e[0],
    setSw = e[1];
  var f = React.useState("a");
  var tb = f[0],
    setTb = f[1];
  var g = React.useState("browse");
  var nav = g[0],
    setNav = g[1];
  var h = React.useState(false);
  var sv = h[0],
    setSv = h[1];
  var i = React.useState("alt");
  var cardVariant = i[0],
    setCardVariant = i[1];
  return /*#__PURE__*/React.createElement("div", {
    className: "stack"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Core"
  }, /*#__PURE__*/React.createElement(Spec, {
    label: "Button \u2014 variants"
  }, /*#__PURE__*/React.createElement(Button, null, "Take quest"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "Message"), /*#__PURE__*/React.createElement(Button, {
    variant: "inverse"
  }, "Post a quest"), /*#__PURE__*/React.createElement(Button, {
    variant: "money",
    icon: "coins"
  }, "Cash out"), /*#__PURE__*/React.createElement(Button, {
    variant: "danger"
  }, "Cancel quest"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "Skip")), /*#__PURE__*/React.createElement(Spec, {
    label: "Button \u2014 sizes, icons, disabled"
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "Small"), /*#__PURE__*/React.createElement(Button, {
    size: "md",
    icon: "zap"
  }, "Medium"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    iconRight: "arrow-right"
  }, "Large"), /*#__PURE__*/React.createElement(Button, {
    disabled: true
  }, "Disabled")), /*#__PURE__*/React.createElement(Spec, {
    label: "IconButton"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "heart",
    label: "Save"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "bell",
    label: "Notifications",
    badge: 3
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "plus",
    label: "Post",
    variant: "primary"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "send",
    label: "Send",
    variant: "inverse"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "search",
    label: "Search",
    variant: "ghost"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "sliders-horizontal",
    label: "Filter",
    shape: "square"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "trash",
    label: "Delete",
    disabled: true
  })), /*#__PURE__*/React.createElement(Spec, {
    label: "Badge \u2014 tones"
  }, /*#__PURE__*/React.createElement(Badge, null, "Neutral"), /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, "New"), /*#__PURE__*/React.createElement(Badge, {
    tone: "money",
    icon: "coins"
  }, "Paid"), /*#__PURE__*/React.createElement(Badge, {
    tone: "hot",
    icon: "clock"
  }, "Ends in 2h"), /*#__PURE__*/React.createElement(Badge, {
    tone: "success",
    icon: "shield-check"
  }, "ID verified"), /*#__PURE__*/React.createElement(Badge, {
    tone: "warning",
    icon: "briefcase"
  }, "Tools needed"), /*#__PURE__*/React.createElement(Badge, {
    tone: "danger"
  }, "Cancelled"), /*#__PURE__*/React.createElement(Badge, {
    tone: "info"
  }, "Info"), /*#__PURE__*/React.createElement(Badge, {
    tone: "ink"
  }, "Featured")), /*#__PURE__*/React.createElement(Spec, {
    label: "Tag"
  }, /*#__PURE__*/React.createElement(Tag, {
    onSelect: function () {}
  }, "Delivery"), /*#__PURE__*/React.createElement(Tag, {
    selected: true,
    onSelect: function () {}
  }, "Dog walking"), /*#__PURE__*/React.createElement(Tag, {
    icon: "package",
    onSelect: function () {}
  }, "Assembly"), /*#__PURE__*/React.createElement(Tag, {
    onRemove: function () {}
  }, "Under 30 min"), /*#__PURE__*/React.createElement(Tag, {
    size: "sm"
  }, "Tech help")), /*#__PURE__*/React.createElement(Spec, {
    label: "Avatar"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Alex L.",
    size: "xs"
  }), /*#__PURE__*/React.createElement(Avatar, {
    name: "Wei-Ting C.",
    size: "sm"
  }), /*#__PURE__*/React.createElement(Avatar, {
    name: "Jason H.",
    size: "md"
  }), /*#__PURE__*/React.createElement(Avatar, {
    name: "Mei-Ling W.",
    size: "lg",
    verified: true
  }), /*#__PURE__*/React.createElement(Avatar, {
    name: "Kuan-Yu T.",
    size: "xl",
    verified: true
  })), /*#__PURE__*/React.createElement(Spec, {
    label: "Icon \u2014 the full 47-glyph set",
    align: "flex-start"
  }, (window.YOUDO_ICON_NAMES || []).map(function (n) {
    return /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        width: 74,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n,
      size: 22
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontFamily: "var(--font-mono)",
        color: "var(--ink-400)",
        textAlign: "center",
        lineHeight: 1.2
      }
    }, n));
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: "Forms"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 14,
      gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "What needs doing?",
    placeholder: "Walk my dog for an hour"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Your offer",
    prefix: "NT$",
    defaultValue: "400"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Where?",
    icon: "map-pin",
    defaultValue: "Da'an",
    error: "Add an address so doers know the distance"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Details",
    multiline: true,
    rows: 3,
    defaultValue: "Biscuit is a very slow beagle. Lead and bags are by the door."
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Category",
    options: ["Delivery", "Dog walking", "Assembly"],
    defaultValue: "Dog walking"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Disabled",
    defaultValue: "Locked",
    disabled: true
  })), /*#__PURE__*/React.createElement(Spec, {
    label: "Checkbox \xB7 Radio \xB7 Switch",
    align: "flex-start"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      minWidth: 220
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Same-day only",
    checked: ck,
    onChange: function () {
      setCk(!ck);
    }
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Verified posters only",
    description: "Shows on your offer",
    checked: !ck,
    onChange: function () {
      setCk(!ck);
    }
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Disabled",
    checked: true,
    disabled: true,
    onChange: function () {}
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      minWidth: 220
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "g",
    label: "Fixed price",
    description: "One agreed amount",
    checked: rd === "fixed",
    onChange: function () {
      setRd("fixed");
    }
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "g",
    label: "Per hour",
    description: "Track time in chat",
    checked: rd === "hourly",
    onChange: function () {
      setRd("hourly");
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      minWidth: 220
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    label: "Quests near me",
    description: "Ping me within 2 km",
    checked: sw,
    onChange: function () {
      setSw(!sw);
    }
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Disabled",
    checked: true,
    disabled: true,
    onChange: function () {}
  })))), /*#__PURE__*/React.createElement(Panel, {
    title: "Surfaces"
  }, /*#__PURE__*/React.createElement(Spec, {
    label: "Card \u2014 variants change only the fill",
    align: "stretch"
  }, ["sticker", "flat", "sunken", "accent", "money", "inverse"].map(function (v) {
    return /*#__PURE__*/React.createElement(Card, {
      key: v,
      variant: v,
      padding: "md",
      style: {
        width: 168
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--weight-bold) var(--text-sm)/1.2 var(--font-text)"
      }
    }, v), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-2xs)",
        opacity: 0.75
      }
    }, v === "inverse" ? "Lime offset shadow" : v === "flat" ? "Hairline, no shadow" : v === "sunken" ? "No border" : "Ink border, 3px shadow"));
  })), /*#__PURE__*/React.createElement(Spec, {
    label: "Toast"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      width: "100%",
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement(Toast, null, "Quest saved"), /*#__PURE__*/React.createElement(Toast, {
    tone: "success"
  }, "Offer sent \u2014 Wei-Ting C. usually replies in 10 min"), /*#__PURE__*/React.createElement(Toast, {
    tone: "money",
    action: "View"
  }, "NT$400 is on its way to your bank"), /*#__PURE__*/React.createElement(Toast, {
    tone: "danger"
  }, "That quest just closed \u2014 here are three more nearby"))), /*#__PURE__*/React.createElement(Spec, {
    label: "Tooltip \xB7 Dialog"
  }, /*#__PURE__*/React.createElement(Tooltip, {
    label: "Payment is held until you mark it done"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "info"
  }, "Hover me")), /*#__PURE__*/React.createElement(Button, {
    onClick: function () {
      setDlg(true);
    }
  }, "Open sheet")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      minHeight: dlg ? 320 : 0,
      transition: "min-height .2s"
    }
  }, /*#__PURE__*/React.createElement(Dialog, {
    open: dlg,
    onClose: function () {
      setDlg(false);
    },
    title: "Make your offer",
    subtitle: "Wei-Ting C. usually replies in 10 min",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: function () {
        setDlg(false);
      }
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: function () {
        setDlg(false);
      }
    }, "Send offer"))
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "d",
    label: "Take it at NT$400",
    description: "Accept the asking price",
    checked: true,
    onChange: function () {}
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Add a note",
    multiline: true,
    rows: 2,
    placeholder: "I walk two dogs on this street already."
  })))), /*#__PURE__*/React.createElement(Panel, {
    title: "Navigation"
  }, /*#__PURE__*/React.createElement(Spec, {
    label: "TopBar",
    align: "stretch"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 390,
      border: "var(--stroke-ink)",
      borderRadius: "var(--radius-card)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    wordmark: true,
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: "bell",
      label: "Notifications",
      size: "sm",
      badge: 3
    })
  }), /*#__PURE__*/React.createElement(TopBar, {
    title: "Walk Biscuit for an hour",
    subtitle: "1.2 km \xB7 Today, 6pm",
    onBack: function () {},
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: "heart",
      label: "Save",
      size: "sm"
    })
  }))), /*#__PURE__*/React.createElement(Spec, {
    label: "Tabs \u2014 segmented and underline",
    align: "stretch"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14,
      width: "100%",
      maxWidth: 390
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tb,
    onChange: setTb,
    items: [{
      value: "a",
      label: "Chats",
      count: 3
    }, {
      value: "b",
      label: "My quests",
      count: 2
    }]
  }), /*#__PURE__*/React.createElement(Tabs, {
    variant: "underline",
    value: tb,
    onChange: setTb,
    items: [{
      value: "a",
      label: "Activity",
      icon: "list-checks"
    }, {
      value: "b",
      label: "Settings",
      icon: "sliders-horizontal"
    }]
  }))), /*#__PURE__*/React.createElement(Spec, {
    label: "TabBar",
    align: "stretch"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 390,
      border: "var(--stroke-ink)",
      borderRadius: "var(--radius-card)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(TabBar, {
    items: TABS,
    value: nav,
    onChange: setNav
  })))), /*#__PURE__*/React.createElement(Panel, {
    title: "Quests"
  }, /*#__PURE__*/React.createElement(Spec, {
    label: "QuestCard \u2014 layout (alternate is now the live design used in Browse; this switcher is just for comparing/fine-tuning)",
    align: "stretch"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    items: [{
      value: "current",
      label: "Current"
    }, {
      value: "alt",
      label: "Alternate"
    }, {
      value: "alt-meta",
      label: "Alt + meta"
    }],
    value: cardVariant,
    onChange: setCardVariant,
    variant: "line",
    style: {
      gap: 16
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      width: "100%",
      maxWidth: 390
    }
  }, cardVariant === "alt" ? [/*#__PURE__*/React.createElement(QuestCard, {
    key: "alt-1",
    variant: "spacious",
    title: "Walk Biscuit for an hour",
    payout: "NT$400",
    distance: "1.2 km",
    duration: "~60 min",
    when: "Today, 6pm",
    category: "Pet care",
    badges: [{
      label: "Ends in 2h",
      tone: "hot",
      icon: "clock"
    }],
    poster: {
      name: "Wei-Ting C.",
      rating: 4.9,
      quests: 38,
      verified: true
    },
    saved: sv,
    onSave: function () {
      setSv(!sv);
    },
    onClick: function () {}
  }), /*#__PURE__*/React.createElement(QuestCard, {
    key: "alt-2",
    variant: "spacious",
    title: "Pick up a parcel from the post office",
    payout: "NT$200",
    distance: "600 m",
    duration: "~20 min",
    category: "Delivery",
    badges: [{
      label: "Tools needed",
      tone: "warning",
      icon: "briefcase"
    }],
    poster: {
      name: "Jason H.",
      rating: 4.7,
      quests: 12
    },
    onClick: function () {}
  })] : cardVariant === "alt-meta" ? [/*#__PURE__*/React.createElement(QuestCard, {
    key: "altmeta-1",
    variant: "spacious-meta",
    title: "Walk Biscuit for an hour",
    payout: "NT$400",
    distance: "1.2 km",
    duration: "~60 min",
    when: "Today, 6pm",
    category: "Pet care",
    badges: [{
      label: "Ends in 2h",
      tone: "hot",
      icon: "clock"
    }],
    poster: {
      name: "Wei-Ting C.",
      rating: 4.9,
      quests: 38,
      verified: true
    },
    saved: sv,
    onSave: function () {
      setSv(!sv);
    },
    onClick: function () {}
  }), /*#__PURE__*/React.createElement(QuestCard, {
    key: "altmeta-2",
    variant: "spacious-meta",
    title: "Pick up a parcel from the post office",
    payout: "NT$200",
    distance: "600 m",
    duration: "~20 min",
    category: "Delivery",
    badges: [{
      label: "Tools needed",
      tone: "warning",
      icon: "briefcase"
    }],
    poster: {
      name: "Jason H.",
      rating: 4.7,
      quests: 12
    },
    onClick: function () {}
  })] : [/*#__PURE__*/React.createElement(QuestCard, {
    key: "cur-1",
    title: "Walk Biscuit for an hour",
    payout: "NT$400",
    distance: "1.2 km",
    duration: "~60 min",
    when: "Today, 6pm",
    badges: [{
      label: "Ends in 2h",
      tone: "hot",
      icon: "clock"
    }],
    poster: {
      name: "Wei-Ting C.",
      rating: 4.9,
      quests: 38,
      verified: true
    },
    saved: sv,
    onSave: function () {
      setSv(!sv);
    },
    onClick: function () {}
  }), /*#__PURE__*/React.createElement(QuestCard, {
    key: "cur-2",
    variant: "compact",
    title: "Pick up a parcel from the post office",
    payout: "NT$200",
    distance: "600 m",
    duration: "~20 min",
    poster: {
      name: "Jason H.",
      rating: 4.7,
      quests: 12
    },
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary"
    }, "Offer")
  })])), /*#__PURE__*/React.createElement(Spec, {
    label: "RewardPill"
  }, /*#__PURE__*/React.createElement(RewardPill, {
    amount: "NT$400"
  }), /*#__PURE__*/React.createElement(RewardPill, {
    amount: "NT$350",
    tone: "quiet"
  }), /*#__PURE__*/React.createElement(RewardPill, {
    amount: "NT$200",
    unit: null,
    tone: "ink",
    icon: null
  }), /*#__PURE__*/React.createElement(RewardPill, {
    amount: "NT$6,840",
    unit: "this month",
    size: "lg",
    icon: "wallet"
  })), /*#__PURE__*/React.createElement(Spec, {
    label: "UserChip"
  }, /*#__PURE__*/React.createElement(UserChip, {
    name: "Wei-Ting C.",
    rating: 4.9,
    quests: 38,
    verified: true,
    size: "lg",
    meta: "Replies in 10 min"
  }), /*#__PURE__*/React.createElement(UserChip, {
    name: "Jason H.",
    rating: 4.7,
    quests: 12
  }), /*#__PURE__*/React.createElement(UserChip, {
    name: "Mei-Ling W.",
    rating: 5.0,
    quests: 3,
    size: "sm"
  })), /*#__PURE__*/React.createElement(Spec, {
    label: "StatusTrack",
    align: "stretch"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      width: "100%",
      maxWidth: 390
    }
  }, /*#__PURE__*/React.createElement(StatusTrack, {
    current: -1
  }), /*#__PURE__*/React.createElement(StatusTrack, {
    current: 1
  }), /*#__PURE__*/React.createElement(StatusTrack, {
    current: 2
  })))));
}

/* ---------------- Tokens ---------------- */

var RAMPS = [{
  label: "Ink — text, borders, inverse surfaces",
  keys: ["--ink-900", "--ink-800", "--ink-700", "--ink-500", "--ink-400", "--ink-300", "--ink-200", "--ink-100"]
}, {
  label: "Paper — grounds and wells",
  keys: ["--paper-000", "--paper-050", "--paper-100", "--paper-200"]
}, {
  label: "Lime — action, one element per screen",
  keys: ["--lime-700", "--lime-600", "--lime-500", "--lime-300", "--lime-200", "--lime-100"]
}, {
  label: "Coin — money, never decoration",
  keys: ["--coin-600", "--coin-500", "--coin-300", "--coin-200", "--coin-100"]
}, {
  label: "Flare — urgency and unread, small doses",
  keys: ["--flare-600", "--flare-500", "--flare-300", "--flare-200", "--flare-100"]
}, {
  label: "Semantic — badges and field errors only",
  keys: ["--success-500", "--warning-500", "--danger-500", "--info-500"]
}];
function Swatch(props) {
  var v = tok(props.name);
  var dark = ["--ink-900", "--ink-800", "--ink-700", "--ink-500"].indexOf(props.name) > -1;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 104
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      background: "var(" + props.name + ")",
      border: "var(--stroke-ink)",
      borderRadius: "var(--radius-sm)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: 10,
      fontFamily: "var(--font-mono)",
      color: "var(--ink-500)",
      lineHeight: 1.35,
      wordBreak: "break-all"
    }
  }, props.name.replace("--", ""), /*#__PURE__*/React.createElement("br", null), v));
}
function TokensTab(props) {
  var typeScale = props.typeScale || {
    display: "md",
    title: "md"
  };
  var setTypeScale = props.setTypeScale || function () {};
  var displayPx = {
    sm: 38,
    md: 48,
    lg: 60
  }[typeScale.display];
  var titlePx = {
    sm: 20,
    md: 24,
    lg: 30
  }[typeScale.title];
  var TYPE = [{
    label: "Display / " + displayPx + " / 800",
    style: {
      font: "var(--weight-black) var(--type-display-size)/1 var(--font-display)",
      letterSpacing: "var(--tracking-display)"
    },
    sample: "Earn nearby",
    scaleControl: {
      title: "Display size",
      value: typeScale.display,
      onChange: function (v) {
        setTypeScale({
          display: v
        });
      }
    }
  }, {
    label: "Title / " + titlePx + " / 700",
    style: {
      font: "var(--weight-bold) var(--type-title-size)/var(--leading-snug) var(--font-display)",
      letterSpacing: "var(--tracking-heading)"
    },
    sample: "Walk Biscuit for an hour",
    scaleControl: {
      title: "Title size",
      value: typeScale.title,
      onChange: function (v) {
        setTypeScale({
          title: v
        });
      }
    }
  }, {
    label: "Body / 16 / 400",
    style: {
      font: "var(--weight-regular) var(--text-md)/var(--leading-normal) var(--font-text)"
    },
    sample: "Biscuit is a very slow beagle who stops at every tree."
  }, {
    label: "Label / 15 / 600",
    style: {
      font: "var(--weight-semibold) var(--text-sm)/1.3 var(--font-text)"
    },
    sample: "What needs doing?"
  }, {
    label: "Meta / 13 / 500",
    style: {
      font: "var(--weight-medium) var(--text-xs)/1.3 var(--font-text)",
      color: "var(--ink-500)"
    },
    sample: "1.2 km · ~60 min · Today, 6pm"
  }, {
    label: "Caps / 12 / 700 / +9%",
    style: {
      font: "var(--weight-bold) var(--text-2xs)/1 var(--font-text)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase"
    },
    sample: "Ends in 2h"
  }, {
    label: "Money / display / tabular",
    style: {
      font: "var(--weight-black) var(--text-3xl)/1 var(--font-display)",
      fontFeatureSettings: "'tnum' 1"
    },
    sample: "NT$6,840"
  }, {
    label: "Mono / codes and IDs",
    style: {
      font: "var(--weight-medium) var(--text-xs)/1.3 var(--font-mono)"
    },
    sample: "CTBC •••• 4417"
  }];
  var SHADOWS = [{
    name: "--shadow-sticker-sm",
    note: "2px · small controls"
  }, {
    name: "--shadow-sticker",
    note: "3px · cards and buttons"
  }, {
    name: "--shadow-sticker-lg",
    note: "5px · hover"
  }, {
    name: "--shadow-pressed",
    note: "1px · pressed"
  }, {
    name: "--shadow-sticker-lime",
    note: "3px lime · inverse cards"
  }];
  var RADII = ["--radius-xs", "--radius-sm", "--radius-card-inner", "--radius-field", "--radius-card", "--radius-sheet", "--radius-pill"];
  var SPACE = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-5", "--space-6", "--space-8", "--space-10"];
  return /*#__PURE__*/React.createElement("div", {
    className: "stack"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Colour"
  }, RAMPS.map(function (r) {
    return /*#__PURE__*/React.createElement(Spec, {
      key: r.label,
      label: r.label,
      align: "flex-start"
    }, r.keys.map(function (k) {
      return /*#__PURE__*/React.createElement(Swatch, {
        key: k,
        name: k
      });
    }));
  }), /*#__PURE__*/React.createElement(Spec, {
    label: "Approved pairings \u2014 nothing else",
    align: "stretch"
  }, [{
    bg: "--lime-500",
    fg: "--ink-900",
    t: "Take quest"
  }, {
    bg: "--coin-500",
    fg: "--ink-900",
    t: "NT$400"
  }, {
    bg: "--ink-900",
    fg: "--paper-050",
    t: "Post a quest"
  }, {
    bg: "--flare-500",
    fg: "--paper-000",
    t: "Ends in 2h"
  }].map(function (p) {
    return /*#__PURE__*/React.createElement("div", {
      key: p.bg,
      style: {
        flex: "1 1 150px",
        minWidth: 150,
        padding: "18px 14px",
        background: "var(" + p.bg + ")",
        color: "var(" + p.fg + ")",
        border: "var(--stroke-ink)",
        borderRadius: "var(--radius-sm)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--weight-bold) var(--text-lg)/1.1 var(--font-display)"
      }
    }, p.t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        opacity: 0.8,
        marginTop: 8
      }
    }, p.fg.replace("--", ""), " on ", p.bg.replace("--", "")));
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: "Type"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, TYPE.map(function (t) {
    return /*#__PURE__*/React.createElement("div", {
      key: t.label,
      style: {
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 200,
        flex: "none",
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        color: "var(--ink-400)"
      }
    }, t.label), /*#__PURE__*/React.createElement("span", {
      style: Object.assign({
        flex: "1 1 auto",
        minWidth: 0
      }, t.style)
    }, t.sample), t.scaleControl ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-2xs)",
        fontWeight: "var(--weight-semibold)",
        color: "var(--ink-500)"
      }
    }, t.scaleControl.title), /*#__PURE__*/React.createElement(Tabs, {
      items: TYPE_SCALE_OPTIONS,
      value: t.scaleControl.value,
      onChange: t.scaleControl.onChange,
      style: {
        width: 132
      }
    })) : null);
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: "Shape"
  }, /*#__PURE__*/React.createElement(Spec, {
    label: "Shadows \u2014 hard offset, zero blur, always ink",
    align: "flex-start"
  }, SHADOWS.map(function (s) {
    return /*#__PURE__*/React.createElement("div", {
      key: s.name,
      style: {
        width: 150
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 64,
        background: s.name === "--shadow-sticker-lime" ? "var(--ink-900)" : "var(--paper-000)",
        border: "var(--stroke-ink)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(" + s.name + ")"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        color: "var(--ink-500)",
        lineHeight: 1.35
      }
    }, s.note));
  })), /*#__PURE__*/React.createElement(Spec, {
    label: "Radii",
    align: "flex-start"
  }, RADII.map(function (r) {
    return /*#__PURE__*/React.createElement("div", {
      key: r,
      style: {
        width: 92,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 64,
        background: "var(--paper-000)",
        border: "var(--stroke-ink)",
        borderRadius: "var(" + r + ")"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6,
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        color: "var(--ink-500)"
      }
    }, tok(r)));
  })), /*#__PURE__*/React.createElement(Spec, {
    label: "Spacing scale",
    align: "flex-end"
  }, SPACE.map(function (s) {
    return /*#__PURE__*/React.createElement("div", {
      key: s,
      style: {
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: tok(s),
        height: tok(s),
        minWidth: 4,
        background: "var(--lime-500)",
        border: "var(--border-hair) solid var(--border-strong)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6,
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        color: "var(--ink-500)"
      }
    }, tok(s)));
  }))));
}

/* ---------------- Screen states ---------------- */

function MiniFrame(props) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      flex: "1 1 320px",
      minWidth: 280
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, props.label), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-page)",
      border: "var(--stroke-ink)",
      borderRadius: "var(--radius-card)",
      padding: "14px",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, props.children), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xs)",
      color: "var(--ink-500)",
      lineHeight: 1.45
    }
  }, props.note));
}
function StatesTab() {
  /* A synthetic store, so the gallery shows real components driven by real
     records rather than screenshots of them. */
  var app = useApp();
  var state = app.state;
  var now = app.now;
  function q(id) { return questById(state, id); }
  var cancelled = q("q9"), expired = q("q10"), completed = q("q7"), paid = q("q8");
  var disputed = Object.assign({}, completed, {
    status: "disputed", disputeReason: "Only half the plants were watered and we couldn't agree in the chat."
  });

  return h("div", { className: "stack" },
    h(Panel, { title: "The three states the exported kit never had" },
      h("p", {
        style: {
          margin: 0, fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)",
          color: "var(--ink-700)", maxWidth: "62ch"
        }
      }, "The prototype shipped exactly one empty state across five screens, and no loading or error state anywhere. Loading is a sunken card carrying a line of text: the system bans skeleton shimmer."),
      h("div", { style: { display: "flex", gap: 18, flexWrap: "wrap" } },
        h(MiniFrame, {
          label: "Loading",
          note: "A sunken card carrying a line of honest text — no shimmer, no spinner."
        }, h(LoadingState, null)),
        h(MiniFrame, {
          label: "Empty — nothing nearby",
          note: "Names the next action rather than reporting the emptiness."
        }, h(EmptyState, {
          title: "Nothing near you right now — widen the radius to 10 km?",
          action: "Widen search", onAction: function () {}
        })),
        h(MiniFrame, {
          label: "Empty — filtered out",
          note: "Different cause, different copy, and a way back out."
        }, h(EmptyState, {
          title: "Nothing matches that yet — widen the radius or clear the filters?",
          action: "Clear filters", onAction: function () {}
        })),
        h(MiniFrame, {
          label: "Error",
          note: "Written as a fix, not a scold. Nothing apologises twice."
        }, h(ErrorState, { onRetry: function () {} })),
        h(MiniFrame, {
          label: "Empty — no chats",
          note: "Points at the action that creates the first thread."
        }, h(EmptyState, {
          title: "No conversations yet — take a quest and the chat opens itself.",
          action: "Browse quests", onAction: function () {}
        })),
        h(MiniFrame, {
          label: "Empty — wallet",
          note: "A zero balance is an invitation, not a dead end."
        }, h(EmptyState, {
          title: "No activity yet — your first payout lands here.",
          action: "Find a quest", onAction: function () {}
        })))),

    h(Panel, { title: "Lifecycle states the prototype had no picture of" },
      h("p", {
        style: {
          margin: 0, fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)",
          color: "var(--ink-700)", maxWidth: "62ch"
        }
      }, "PRD §8 names nine states. The kit modelled four display steps and could execute none of them; cancelled, expired and disputed had no representation at all. Each one below is rendered from a real record in the fixture, so what you are looking at is what the app builds."),
      h("div", { style: { display: "flex", gap: 18, flexWrap: "wrap" } },
        h(MiniFrame, {
          label: "Status vocabulary",
          note: "One word per state, identical on both sides of the quest."
        }, h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
          Object.keys(STATUS_META).map(function (s) {
            return h(StatusBadge, { key: s, status: s });
          }))),
        h(MiniFrame, {
          label: "Cancelled",
          note: "A normal event with a reason and a refund, not a failure screen."
        }, h(ClosedNote, { quest: cancelled, actorId: "u0" })),
        h(MiniFrame, {
          label: "Expired",
          note: "Says why nothing happened and what would change it."
        }, h(ClosedNote, { quest: expired, actorId: "u0" })),
        h(MiniFrame, {
          label: "Disputed",
          note: "Escrow frozen. The only state where money stops moving."
        }, h(ClosedNote, { quest: disputed, actorId: "u0" })),
        h(MiniFrame, {
          label: "Confirm window — poster",
          note: "A countdown that says what happens at zero: it pays out, it doesn't lapse."
        }, h(ConfirmWindow, { quest: completed, now: now })),
        h(MiniFrame, {
          label: "Confirm window — doer",
          note: "Same record, the other side's stake in it."
        }, h(ConfirmWindow, { quest: completed, now: now, doerSide: true })),
        h(MiniFrame, {
          label: "Confirm window — closed",
          note: "Past the deadline the clock stops claiming there is time left."
        }, h(ConfirmWindow, { quest: completed, now: ms(completed.completedAt) + CONFIRM_WINDOW_MS + HOUR_MS })),
        h(MiniFrame, {
          label: "Track — assigned / doing / paid",
          note: "Driven by quest.status, never by a hand-set index."
        }, h("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
          [0, 1, 2].map(function (n) {
            return h(StatusTrack, { key: n, current: n });
          }))))),

    h(Panel, { title: "Address privacy and the money disclosure" },
      h("p", {
        style: {
          margin: 0, fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)",
          color: "var(--ink-700)", maxWidth: "62ch"
        }
      }, "Two rules that are requirements rather than niceties: the exact address is private until acceptance (PRD §4.3), and the fee is shown before the commitment, never after (PRD §4.5). Both are enforced in the store — these are what enforcement looks like."),
      h("div", { style: { display: "flex", gap: 18, flexWrap: "wrap" } },
        h(MiniFrame, {
          label: "Address — before acceptance",
          note: "A district and a coarse distance. Nobody gets the street until they're matched."
        }, h(AddressBlock, { quest: paid, visible: false, distanceM: 2400 })),
        h(MiniFrame, {
          label: "Address — after acceptance",
          note: "Revealed to exactly one person, and it arrives in the thread too."
        }, h(AddressBlock, { quest: paid, visible: true, distanceM: 2400 })),
        h(MiniFrame, {
          label: "Fee — poster's side",
          note: "The rate is named. PRD §14.1 hasn't settled it; one constant decides it."
        }, h(FeeBreakdown, { amountMinor: 40000 })),
        h(MiniFrame, {
          label: "Fee — doer's side",
          note: "Same arithmetic, phrased as what lands in their wallet."
        }, h(FeeBreakdown, { amountMinor: 40000, doerSide: true, title: "What you'll be paid" })))),

    h(Panel, { title: "Offer states" },
      h("p", {
        style: {
          margin: 0, fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)",
          color: "var(--ink-700)", maxWidth: "62ch"
        }
      }, "An offer is a record with four ends: accepted, declined, withdrawn, or expired with the quest. The doer sees their own offer's state; the poster sees the row they act on."),
      h("div", { style: { display: "flex", gap: 18, flexWrap: "wrap" } },
        ["pending", "accepted", "declined", "withdrawn", "expired"].map(function (s) {
          return h(MiniFrame, {
            key: s, label: "Doer's view — " + s,
            note: s === "pending" ? "The only state with a way out of it." : "Read-only. The record stays."
          }, h(MyOfferPanel, {
            offer: { id: "demo-" + s, status: s, amountMinor: 35000, note: s === "pending" ? "I have a drill and I'm free all Saturday morning." : "" },
            onWithdraw: function () {}
          }));
        }),
        h(MiniFrame, {
          label: "Poster's view — a live offer",
          note: "Price against asking, the note, and the three things they can do."
        }, h(OfferRow, {
          offer: { id: "demo-row", doerId: "u3", amountMinor: 30000, createdAt: isoAt(now - 2 * HOUR_MS),
                   note: "Three bags is a bit much for one trip — I'd do it for a little more." },
          quest: q("q6"), now: now,
          onAccept: function () {}, onDecline: function () {}, onMessage: function () {}
        })))),

    h(Panel, { title: "Ratings capture" },
      h("p", {
        style: {
          margin: 0, fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)",
          color: "var(--ink-700)", maxWidth: "62ch"
        }
      }, "The kit could display a rating; nothing could leave one. Ratings unlock after paid, and stay hidden until both sides submit or 14 days pass — so nobody rates defensively."),
      h("div", { style: { display: "flex", gap: 18, flexWrap: "wrap" } },
        h(MiniFrame, {
          label: "Star picker",
          note: "44pt targets, a word per value, and the value is announced to assistive tech."
        }, h("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
          [0, 3, 5].map(function (n) {
            return h("div", { key: n, style: { display: "flex", alignItems: "center", gap: 10 } },
              h(StarPicker, { value: n, onChange: function () {} }),
              h("span", { style: { fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" } },
                n ? RATING_WORDS[n] : "Tap a star"));
          }))),
        h(MiniFrame, {
          label: "Prompt after payment",
          note: "Says what the rating is for rather than asking for a favour."
        }, h(EmptyState, {
          title: "Rate Jason H. — it's what the next person goes on.",
          action: "Leave a rating", onAction: function () {}
        })))));
}

/* ---------------- Flows ----------------
   ADR-008's third preview surface: a scripted two-sided walkthrough. Each step
   switches chair and performs a real transition on a real store — no mocked
   screenshots — so the whole loop can be reviewed in order, with the money
   visible at every hop. */

var FLOW_SCRIPT = [
  {
    actor: "u1", title: "Wei-Ting posts the quest",
    detail: "NT$400, today at six, Da'an. Nothing has left her wallet.",
    expect: "open · no offers",
    run: function (app, ref) {
      ref.questId = app.postQuest({
        title: "Walk Biscuit for an hour",
        details: "Biscuit is a very slow beagle who stops at every tree. An hour around the park is plenty.",
        categoryId: "dog-walking", payoutMinor: 40000, payoutUnit: "fixed",
        estimatedMinutes: 60, addressLine: "14B, Lane 31, Yongkang St", area: "Da'an",
        point: D.areas["Da'an"],
        scheduledFor: isoAt(app.now + 9 * HOUR_MS),
        expiresAt: isoAt(app.now + 8 * HOUR_MS),
        requirements: ["Comfortable with medium dogs"]
      });
    }
  },
  {
    actor: "u0", title: "Alex offers the asking price",
    detail: "A thread opens, bound to this quest and this doer. Nobody else can see it.",
    expect: "1 offer pending · thread created",
    run: function (app, ref) {
      app.sendOffer(questById(app.state, ref.questId), 40000,
        "I walk a dog on Yongkang already — happy to send a photo mid-walk.");
    }
  },
  {
    actor: "u3", title: "Mei-Ling offers more",
    detail: "A second, separate thread. Two offers on one quest, two conversations.",
    expect: "2 offers pending · 2 threads",
    run: function (app, ref) {
      app.sendOffer(questById(app.state, ref.questId), 45000, "I could do it, but Saturdays are busy for me.");
    }
  },
  {
    actor: "u1", title: "Wei-Ting accepts Alex",
    detail: "The only action in the app that moves money. NT$400 leaves her available balance for escrow, Mei-Ling is declined automatically, and Alex gets the address.",
    expect: "assigned · NT$400 held · 1 declined",
    run: function (app, ref) {
      var q = questById(app.state, ref.questId);
      var mine = myOfferOn(app.state, q.id, "u0");
      if (mine) app.acceptOffer(mine);
    }
  },
  {
    actor: "u0", title: "Alex starts the quest",
    detail: "Wei-Ting is told. The status is the same word on both phones.",
    expect: "in progress",
    run: function (app, ref) { app.startQuest(questById(app.state, ref.questId)); }
  },
  {
    actor: "u0", title: "Alex marks it done",
    detail: "The 72-hour confirm window opens. If Wei-Ting never responds, it pays out anyway.",
    expect: "completed · 72 hr window running",
    run: function (app, ref) { app.markDone(questById(app.state, ref.questId)); }
  },
  {
    actor: "u1", title: "Wei-Ting confirms",
    detail: "Escrow releases: NT$360 to Alex, NT$40 platform fee. The transaction's entries sum to zero.",
    expect: "paid · NT$360 to Alex · NT$40 fee",
    run: function (app, ref) { app.confirmDone(questById(app.state, ref.questId)); }
  },
  {
    actor: "u1", title: "Wei-Ting rates Alex",
    detail: "Ratings unlock only now. Hers stays hidden until Alex rates back.",
    expect: "1 of 2 ratings in",
    run: function (app, ref) {
      app.submitReview(questById(app.state, ref.questId), 5, "On time, and sent the photo without being asked.");
    }
  },
  {
    actor: "u0", title: "Alex rates Wei-Ting",
    detail: "Both in, so both appear. The loop is closed.",
    expect: "both ratings visible",
    run: function (app, ref) {
      app.submitReview(questById(app.state, ref.questId), 5, "Clear instructions and a very agreeable beagle.");
    }
  }
];

function FlowReadout(props) {
  var app = props.app, state = app.state;
  var quest = props.questId ? questById(state, props.questId) : null;
  if (!quest) {
    return h(Card, { variant: "sunken", padding: "md" },
      h("span", { style: { fontSize: "var(--text-sm)", color: "var(--text-secondary)" } },
        "Run the first step and the quest appears here."));
  }
  var offers = offersFor(state, quest.id);
  var last = state.ledger.length ? state.ledger[state.ledger.length - 1] : null;
  var lastTxn = last ? state.ledger.filter(function (e) { return e.txnId === last.txnId; }) : [];
  var sum = lastTxn.reduce(function (s, e) { return s + e.amountMinor; }, 0);

  return h("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
    h(Card, { padding: "md" },
      h("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } },
        h(StatusBadge, { status: quest.status }),
        h("span", { style: { flex: 1, minWidth: 0, fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" } }, quest.title),
        h(RewardPill, { amount: formatMoney(quest.payoutMinor), unit: null, tone: "quiet" })),
      h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 } },
        offers.length === 0 ? h(Badge, { size: "sm" }, "No offers") : offers.map(function (o) {
          return h(Badge, {
            key: o.id, size: "sm",
            tone: o.status === "accepted" ? "success" : o.status === "pending" ? "warning" : "neutral"
          }, userOf(o.doerId).name.split(" ")[0] + " " + o.status);
        }))),
    h(Card, { variant: "sunken", padding: "md" },
      h(Eyebrow, null, "Wallets"),
      ["u1", "u0"].map(function (id, i) {
        return h(InfoRow, {
          key: id, icon: "wallet", label: userOf(id).name, last: i === 1,
          value: formatMoney(availableOf(state, id)) +
            (balanceOf(state.ledger, "user_held", id) ? "  ·  " + formatMoney(balanceOf(state.ledger, "user_held", id)) + " held" : "")
        });
      })),
    lastTxn.length ? h(Card, { variant: "sunken", padding: "md" },
      h(Eyebrow, null, "Last transaction"),
      lastTxn.map(function (e, i) {
        return h(InfoRow, {
          key: e.id, label: e.account + (e.userId ? " · " + userOf(e.userId).name : ""),
          value: (e.amountMinor > 0 ? "+" : "") + formatMoney(e.amountMinor),
          last: i === lastTxn.length - 1
        });
      }),
      h("div", {
        style: {
          display: "flex", alignItems: "center", gap: 6, marginTop: 8, paddingTop: 8,
          borderTop: "var(--border-hair) solid var(--border-subtle)"
        }
      },
        h(Icon, { name: sum === 0 ? "check-circle" : "alert-triangle", size: 15, color: sum === 0 ? "var(--success-600)" : "var(--danger-600)" }),
        h("span", { style: { fontSize: "var(--text-2xs)", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" } },
          "sums to " + sum + (sum === 0 ? " — invariant holds" : " — INVARIANT BROKEN")))) : null);
}

function FlowRunner() {
  var app = useApp();
  var ref = React.useRef({ questId: null });
  var ix = React.useState(0);
  var step = ix[0], setStep = ix[1];
  var queued = React.useRef(null);

  /* Switching chair is a state change, so the action has to wait for the
     render that carries the new actor — otherwise it would run as whoever was
     holding the phone a moment ago. */
  React.useEffect(function () {
    var job = queued.current;
    if (job && job.actor === app.actorId) {
      queued.current = null;
      job.run(app, ref.current);
      setStep(job.index + 1);
    }
  }, [app.actorId, step]);

  function runNext() {
    if (step >= FLOW_SCRIPT.length) return;
    var s = FLOW_SCRIPT[step];
    queued.current = { actor: s.actor, run: s.run, index: step };
    if (app.actorId === s.actor) {
      queued.current = null;
      s.run(app, ref.current);
      setStep(step + 1);
    } else {
      app.setActor(s.actor);
    }
  }
  function runAll() {
    /* One step per click is the honest pace — batching would hide the fact
       that each transition is a separate guarded write. */
    runNext();
  }

  var quest = ref.current.questId ? questById(app.state, ref.current.questId) : null;
  var done = step >= FLOW_SCRIPT.length;

  return h("div", { style: { display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" } },
    h("div", { style: { flex: "1 1 340px", minWidth: 300, display: "flex", flexDirection: "column", gap: 14 } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
        h(Badge, { tone: done ? "success" : "accent" },
          done ? "Loop closed" : "Step " + (step + 1) + " of " + FLOW_SCRIPT.length),
        h("span", { style: { flex: 1 } }),
        h(Button, {
          variant: "secondary", size: "sm", icon: "arrow-left",
          onClick: function () { app.setActor(D.meId); setStep(0); ref.current = { questId: null }; queued.current = null; window.location.reload(); }
        }, "Start over"),
        h(Button, {
          variant: "primary", size: "sm", iconRight: "arrow-right",
          disabled: done, onClick: runAll
        }, done ? "All done" : "Run next step")),

      h("ol", { style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 } },
        FLOW_SCRIPT.map(function (s, i) {
          var state = i < step ? "done" : i === step ? "now" : "next";
          var who = userOf(s.actor);
          return h("li", {
            key: s.title,
            style: {
              display: "flex", gap: 10, padding: "12px 14px",
              background: state === "now" ? "var(--lime-200)" : state === "done" ? "var(--paper-000)" : "var(--surface-sunken)",
              border: "var(--border-width) solid " + (state === "next" ? "var(--border-default)" : "var(--border-strong)"),
              borderRadius: "var(--radius-card-inner)",
              opacity: state === "next" ? 0.72 : 1
            }
          },
            h("span", {
              style: {
                display: "grid", placeItems: "center", width: 24, height: 24, flex: "none",
                background: state === "done" ? "var(--ink-900)" : "var(--paper-000)",
                border: "var(--border-width) solid var(--border-strong)",
                borderRadius: "var(--radius-pill)",
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                color: state === "done" ? "var(--paper-050)" : "var(--ink-900)"
              }
            }, state === "done" ? h(Icon, { name: "check", size: 12, strokeWidth: 3, color: "var(--paper-050)" }) : String(i + 1)),
            h("div", { style: { flex: 1, minWidth: 0 } },
              h("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
                h(Avatar, { name: who.name, size: "sm" }),
                h("span", { style: { fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)" } }, s.title)),
              h("p", {
                style: {
                  margin: "6px 0 0", fontSize: "var(--text-2xs)",
                  lineHeight: "var(--leading-normal)", color: "var(--ink-700)"
                }
              }, s.detail),
              h("span", {
                style: {
                  display: "inline-block", marginTop: 6, fontSize: "var(--text-3xs)",
                  fontFamily: "var(--font-mono)", color: "var(--ink-500)"
                }
              }, s.expect)));
        })),

      h(FlowReadout, { app: app, questId: ref.current.questId })),

    /* The same screen the app ships, rendered from whichever chair the script
       is sitting in. */
    h("div", { style: { flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 10 } },
      h(Eyebrow, null, "What " + app.me().name + " sees"),
      h("div", { className: "frame", style: { height: 620 } },
        h("div", { style: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } },
          quest
            ? h(QuestDetailScreen, {
                key: quest.id + app.actorId, quest: quest, app: app,
                onBack: function () {}, onOpenThread: function () {},
                onOpenProfile: function () {}, onReviewOffers: function () {},
                onOffered: function () {}, onRate: function () {}
              })
            : h(Body, null, h(EmptyState, {
                title: "Nothing posted yet — run the first step and Wei-Ting's quest appears here.",
                action: "Run next step", onAction: runAll
              }))),
        app.toast ? h("div", { className: "toasts" },
          h(Toast, { key: app.toast.key, tone: app.toast.tone }, app.toast.text)) : null)));
}

function FlowsTab() {
  return h("div", { className: "stack" },
    h(Panel, { title: "The whole loop, both sides, on one store" },
      h("p", {
        style: {
          margin: 0, fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)",
          color: "var(--ink-700)", maxWidth: "62ch"
        }
      }, "Nine steps from an empty feed to two ratings, alternating between the poster and the doer. Every step is a real guarded transition against a real store — the readout underneath shows the quest status, both wallets and the last ledger transaction, which is checked to sum to zero as it is written."),
      h(FlowRunner, null)));
}
/* ---------------- Page shell ---------------- */

var VIEWS = [{
  value: "prototype",
  label: "Prototype"
}, {
  value: "flows",
  label: "Flows"
}, {
  value: "components",
  label: "Components"
}, {
  value: "tokens",
  label: "Tokens"
}, {
  value: "states",
  label: "States"
}];
function App() {
  var a = React.useState("prototype");
  var view = a[0],
    setView = a[1];
  var ts = React.useState(loadTypeScale);
  var typeScale = ts[0],
    setTypeScaleState = ts[1];
  React.useEffect(function () {
    applyTypeScale(typeScale);
  }, [typeScale]);
  function setTypeScale(patch) {
    setTypeScaleState(function (prev) {
      return Object.assign({}, prev, patch);
    });
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("header", {
    className: "chrome"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chrome-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wordmark"
  }, "You", /*#__PURE__*/React.createElement("span", null, "DO")), /*#__PURE__*/React.createElement("div", {
    className: "chrome-tabs",
    style: {
      flex: "1 1 260px",
      minWidth: 0,
      maxWidth: 440
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: view,
    onChange: setView,
    items: VIEWS
  })), /*#__PURE__*/React.createElement("div", {
    className: "chrome-note"
  }, "running the exported bundle \xB7 Taipei \xB7 TWD"))), /*#__PURE__*/React.createElement("main", {
    className: view === "prototype" ? "main main-app" : "main"
  }, view === "prototype" ? /*#__PURE__*/React.createElement(Prototype, null) : null, view === "flows" ? /*#__PURE__*/React.createElement(FlowsTab, null) : null, view === "components" ? /*#__PURE__*/React.createElement(ComponentsTab, null) : null, view === "tokens" ? /*#__PURE__*/React.createElement(TokensTab, {
    typeScale: typeScale,
    setTypeScale: setTypeScale
  }) : null, view === "states" ? /*#__PURE__*/React.createElement(StatesTab, null) : null));
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
