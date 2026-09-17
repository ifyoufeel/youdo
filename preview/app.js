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
/* Turns a <input type=date> + <input type=time> pair into the "Today, 6pm"
   style string every quest card already expects — picked from a calendar
   instead of typed, so it can't be misspelled and always matches "now". */
function formatWhen(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "";
  var todayISO = D.now.slice(0, 10);
  var tmrISO = addDaysISO(todayISO, 1);
  var timeLabel = formatTime12(timeStr);
  if (dateStr === todayISO) return "Today, " + timeLabel;
  if (dateStr === tmrISO) return "Tomorrow, " + timeLabel;
  return weekdayShort(dateStr) + ", " + timeLabel;
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
var SECTION_LABEL = {
  font: "var(--weight-bold) var(--text-2xs)/1 var(--font-text)",
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
/* YouDO M0 preview — the clickable prototype.
   Interactions that were dead in the exported kit are real here: filtering,
   sorting, offer pricing, posting, per-thread chat, and mark-as-done releasing
   escrow. Everything runs on local state; no network, no persistence. */

var DEFAULT_FILTERS = {
  radiusM: 5000,
  minPayMinor: 0,
  verifiedOnly: false,
  todayOnly: false
};
var SORTS = [{
  value: "closest",
  label: "Closest first"
}, {
  value: "pay",
  label: "Best paid"
}, {
  value: "ending",
  label: "Ending soonest"
}, {
  value: "newest",
  label: "Newest"
}];
function sortLabel(v) {
  for (var i = 0; i < SORTS.length; i++) if (SORTS[i].value === v) return SORTS[i].label;
  return v;
}
function useApp() {
  var s = {};
  var a = React.useState(D.quests);
  s.quests = a[0];
  s.setQuests = a[1];
  var b = React.useState(D.threads);
  s.threads = b[0];
  s.setThreads = b[1];
  var c = React.useState(D.messagesByThread);
  s.messages = c[0];
  s.setMessages = c[1];
  var d = React.useState(D.ledger);
  s.ledger = d[0];
  s.setLedger = d[1];
  var e = React.useState(D.myQuests);
  s.myQuests = e[0];
  s.setMyQuests = e[1];
  var f = React.useState([]);
  s.saved = f[0];
  s.setSaved = f[1];
  var g = React.useState(DEFAULT_FILTERS);
  s.filters = g[0];
  s.setFilters = g[1];
  var h = React.useState("closest");
  s.sort = h[0];
  s.setSort = h[1];
  var i = React.useState(D.me.availableMinor);
  s.available = i[0];
  s.setAvailable = i[1];
  s.held = s.ledger.reduce(function (sum, l) {
    return l.state === "held" ? sum + l.amountMinor : sum;
  }, 0);
  return s;
}

/* ---------------- Browse ---------------- */

function BrowseScreen(props) {
  var app = props.app;
  var q = React.useState("")[0],
    setQ = React.useState("")[1];
  var st = React.useState("");
  q = st[0];
  setQ = st[1];
  var ct = React.useState("all");
  var cat = ct[0],
    setCat = ct[1];
  var sh = React.useState(false);
  var sheet = sh[0],
    setSheet = sh[1];
  var dr = React.useState(null);
  var draft = dr[0],
    setDraft = dr[1];
  function openSheet() {
    setDraft({
      filters: Object.assign({}, app.filters),
      sort: app.sort
    });
    setSheet(true);
  }
  function applySheet() {
    app.setFilters(draft.filters);
    app.setSort(draft.sort);
    setSheet(false);
  }
  function patch(k, v) {
    setDraft({
      filters: Object.assign({}, draft.filters, patchObj(k, v)),
      sort: draft.sort
    });
  }
  function patchObj(k, v) {
    var o = {};
    o[k] = v;
    return o;
  }
  var list = app.quests.filter(function (x) {
    if (x.status !== "open") return false;
    if (cat !== "all" && x.categoryId !== cat) return false;
    if (q) {
      var hay = (x.title + " " + x.details).toLowerCase();
      if (hay.indexOf(q.toLowerCase()) < 0) return false;
    }
    if (x.distanceM > app.filters.radiusM) return false;
    if (x.payoutMinor < app.filters.minPayMinor) return false;
    if (app.filters.verifiedOnly && !userOf(x.posterId).verified) return false;
    if (app.filters.todayOnly && x.when.indexOf("Today") !== 0) return false;
    return true;
  });
  var order = app.quests.map(function (x) {
    return x.id;
  });
  list = list.slice().sort(function (m, n) {
    if (app.sort === "closest") return m.distanceM - n.distanceM;
    if (app.sort === "pay") return n.payoutMinor - m.payoutMinor;
    if (app.sort === "ending") return m.expiresAt < n.expiresAt ? -1 : 1;
    return order.indexOf(n.id) - order.indexOf(m.id);
  });
  var filtersOn = app.filters.radiusM !== DEFAULT_FILTERS.radiusM || app.filters.minPayMinor !== DEFAULT_FILTERS.minPayMinor || app.filters.verifiedOnly || app.filters.todayOnly;
  var nearby = list.reduce(function (sum, x) {
    return sum + x.payoutMinor;
  }, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    wordmark: true,
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: "bell",
      label: "Notifications",
      size: "sm",
      badge: 3
    })
  }), /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Input, {
    icon: "search",
    placeholder: "Search quests near you",
    value: q,
    onChange: function (ev) {
      setQ(ev.target.value);
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      overflowX: "auto",
      paddingBottom: 2,
      minWidth: 0,
      flex: "none"
    }
  }, D.categories.map(function (c) {
    return /*#__PURE__*/React.createElement(Tag, {
      key: c.id,
      size: "sm",
      selected: cat === c.id,
      onSelect: function () {
        setCat(c.id);
      }
    }, c.label);
  })), list.length ? /*#__PURE__*/React.createElement(Card, {
    variant: "accent",
    padding: "md"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--weight-black) var(--text-xl)/1.1 var(--font-display)",
      letterSpacing: "var(--tracking-heading)"
    }
  }, formatMoney(nearby), " waiting nearby"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-2xs)",
      marginTop: 2
    }
  }, list.length, " ", list.length === 1 ? "quest" : "quests", " within ", formatDistance(app.filters.radiusM))), /*#__PURE__*/React.createElement(Icon, {
    name: "coins",
    size: 24
  }))) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: "var(--text-2xs)",
      color: "var(--text-secondary)",
      fontWeight: "var(--weight-medium)"
    }
  }, list.length, " ", list.length === 1 ? "quest" : "quests", " \xB7 ", sortLabel(app.sort)), /*#__PURE__*/React.createElement(IconButton, {
    icon: "sliders-horizontal",
    label: "Sort and filter",
    size: "sm",
    active: filtersOn,
    onClick: openSheet
  })), list.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    title: q || cat !== "all" || filtersOn ? "Nothing matches that yet — widen the radius or clear the filters?" : "Nothing near you right now — widen the radius to 10 km?",
    action: "Clear filters",
    onAction: function () {
      setQ("");
      setCat("all");
      app.setFilters(DEFAULT_FILTERS);
    }
  }) : list.map(function (x) {
    var u = userOf(x.posterId);
    return /*#__PURE__*/React.createElement(QuestCard, {
      key: x.id,
      variant: "spacious",
      title: x.title,
      payout: formatMoney(x.payoutMinor),
      distance: formatDistance(x.distanceM),
      duration: formatDuration(x.estimatedMinutes),
      when: x.when,
      badges: x.badges,
      poster: posterProp(u),
      saved: app.saved.indexOf(x.id) > -1,
      onSave: function () {
        props.onToggleSave(x.id);
      },
      onClick: function () {
        props.onOpen(x.id);
      }
    });
  })), /*#__PURE__*/React.createElement(Dialog, {
    open: sheet,
    onClose: function () {
      setSheet(false);
    },
    title: "Sort and filter",
    subtitle: "Applies to the quest list",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: function () {
        setDraft({
          filters: DEFAULT_FILTERS,
          sort: "closest"
        });
      }
    }, "Reset"), /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: applySheet
    }, "Show quests"))
  }, draft ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, "Sort by"), SORTS.map(function (o) {
    return /*#__PURE__*/React.createElement(Radio, {
      key: o.value,
      name: "sort",
      label: o.label,
      checked: draft.sort === o.value,
      onChange: function () {
        setDraft({
          filters: draft.filters,
          sort: o.value
        });
      }
    });
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Distance",
    options: [{
      value: "1000",
      label: "Within 1 km"
    }, {
      value: "3000",
      label: "Within 3 km"
    }, {
      value: "5000",
      label: "Within 5 km"
    }, {
      value: "10000",
      label: "Within 10 km"
    }],
    value: String(draft.filters.radiusM),
    onChange: function (ev) {
      patch("radiusM", parseInt(ev.target.value, 10));
    }
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Pays at least",
    options: [{
      value: "0",
      label: "Any amount"
    }, {
      value: "20000",
      label: "NT$200"
    }, {
      value: "30000",
      label: "NT$300"
    }, {
      value: "50000",
      label: "NT$500"
    }],
    value: String(draft.filters.minPayMinor),
    onChange: function (ev) {
      patch("minPayMinor", parseInt(ev.target.value, 10));
    }
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Today only",
    checked: draft.filters.todayOnly,
    onChange: function () {
      patch("todayOnly", !draft.filters.todayOnly);
    }
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Verified posters only",
    checked: draft.filters.verifiedOnly,
    onChange: function () {
      patch("verifiedOnly", !draft.filters.verifiedOnly);
    }
  })) : null));
}

/* ---------------- Quest detail ---------------- */

function Row(props) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 0",
      borderBottom: "var(--border-hair) solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: props.icon,
    size: 17,
    color: "var(--ink-500)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)"
    }
  }, props.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-bold)"
    }
  }, props.value));
}
function QuestDetailScreen(props) {
  var quest = props.quest,
    app = props.app;
  var u = userOf(quest.posterId);
  var a = React.useState(false);
  var sheet = a[0],
    setSheet = a[1];
  var b = React.useState("asking");
  var mode = b[0],
    setMode = b[1];
  var c = React.useState(String(quest.payoutMinor / 100));
  var price = c[0],
    setPrice = c[1];
  var e = React.useState("");
  var note = e[0],
    setNote = e[1];
  var offerMinor = mode === "asking" ? quest.payoutMinor : Math.max(0, Math.round(parseFloat(price || "0") * 100));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: quest.title,
    subtitle: formatDistance(quest.distanceM) + " · " + quest.when,
    onBack: props.onBack,
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: "heart",
      label: "Save",
      size: "sm",
      filled: app.saved.indexOf(quest.id) > -1,
      onClick: function () {
        props.onToggleSave(quest.id);
      },
      style: {
        color: app.saved.indexOf(quest.id) > -1 ? "var(--flare-500)" : undefined
      }
    })
  }), /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, quest.badges.map(function (bd) {
    return /*#__PURE__*/React.createElement(Badge, {
      key: bd.label,
      tone: bd.tone,
      icon: bd.icon,
      size: "sm"
    }, bd.label);
  }), /*#__PURE__*/React.createElement(Tag, {
    size: "sm"
  }, categoryLabel(quest.categoryId))), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "2px 0 0",
      font: "var(--weight-black) var(--type-title-size)/var(--leading-snug) var(--font-display)",
      letterSpacing: "var(--tracking-heading)"
    }
  }, quest.title), /*#__PURE__*/React.createElement(RewardPill, {
    amount: formatMoney(quest.payoutMinor),
    size: "lg"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-normal)",
      color: "var(--ink-700)"
    }
  }, quest.details)), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Row, {
    icon: "map-pin",
    label: "Where",
    value: quest.area
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "clock",
    label: "How long",
    value: formatDuration(quest.estimatedMinutes)
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "calendar",
    label: "When",
    value: quest.when
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      paddingTop: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "coins",
    size: 17,
    color: "var(--ink-500)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)"
    }
  }, "Payment"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-bold)"
    }
  }, "Held until you mark it done"))), /*#__PURE__*/React.createElement(Card, {
    variant: "sunken",
    padding: "md"
  }, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, "What's needed"), quest.requirements.map(function (r) {
    return /*#__PURE__*/React.createElement("div", {
      key: r,
      style: {
        display: "flex",
        gap: 8,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 15,
      strokeWidth: 2.5,
      style: {
        marginTop: 2
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)"
      }
    }, r));
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(UserChip, {
    name: u.name,
    rating: u.rating,
    quests: u.questsCompleted,
    verified: u.verified,
    size: "lg",
    meta: "Replies in 10 min"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "message-circle",
    label: "Message poster",
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      paddingTop: 10,
      borderTop: "var(--border-hair) solid var(--border-subtle)"
    }
  }, u.verified ? /*#__PURE__*/React.createElement(Badge, {
    tone: "success",
    icon: "shield-check",
    size: "sm"
  }, "ID verified") : null, /*#__PURE__*/React.createElement(Badge, {
    size: "sm"
  }, quest.offersCount, " offers so far"))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      color: "var(--text-muted)",
      textAlign: "center"
    }
  }, "Exact address is shared once your offer is accepted")), /*#__PURE__*/React.createElement(Slab, null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    icon: "message-circle",
    style: {
      padding: "0 18px"
    }
  }, "Ask"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "zap",
    fullWidth: true,
    onClick: function () {
      setSheet(true);
    }
  }, "Take this quest")), /*#__PURE__*/React.createElement(Dialog, {
    open: sheet,
    onClose: function () {
      setSheet(false);
    },
    title: "Make your offer",
    subtitle: u.name + " usually replies in 10 min",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: function () {
        setSheet(false);
      }
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      disabled: offerMinor <= 0,
      onClick: function () {
        setSheet(false);
        props.onOffer(quest, offerMinor, note);
      }
    }, "Send offer"))
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "mode",
    label: "Take it at " + formatMoney(quest.payoutMinor),
    description: "Accept the asking price",
    checked: mode === "asking",
    onChange: function () {
      setMode("asking");
    }
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "mode",
    label: "Offer a different price",
    description: "Say what you'd do it for",
    checked: mode === "custom",
    onChange: function () {
      setMode("custom");
    }
  }), mode === "custom" ? /*#__PURE__*/React.createElement(Input, {
    label: "Your price",
    prefix: "NT$",
    value: price,
    onChange: function (ev) {
      setPrice(ev.target.value.replace(/[^0-9.]/g, ""));
    }
  }) : null, /*#__PURE__*/React.createElement(Input, {
    label: "Add a note",
    multiline: true,
    rows: 2,
    value: note,
    onChange: function (ev) {
      setNote(ev.target.value);
    },
    placeholder: "I walk two dogs on this street already \u2014 happy to send a photo mid-walk."
  })));
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

function PostQuestScreen(props) {
  var app = props.app;
  var a = React.useState("");
  var title = a[0],
    setTitle = a[1];
  var b = React.useState("delivery");
  var cat = b[0],
    setCat = b[1];
  var c = React.useState("");
  var budget = c[0],
    setBudget = c[1];
  var e = React.useState("");
  var details = e[0],
    setDetails = e[1];
  var f = React.useState("");
  var address = f[0],
    setAddress = f[1];
  var g = React.useState("");
  var whenDate = g[0],
    setWhenDate = g[1];
  var g2 = React.useState("");
  var whenTime = g2[0],
    setWhenTime = g2[1];
  var h = React.useState(false);
  var urgent = h[0],
    setUrgent = h[1];
  var i = React.useState(false);
  var tried = i[0],
    setTried = i[1];
  var ds = React.useState(false);
  var dateSheet = ds[0],
    setDateSheet = ds[1];
  var tsh = React.useState(false);
  var timeSheet = tsh[0],
    setTimeSheet = tsh[1];
  var budgetMinor = Math.max(0, Math.round(parseFloat(budget || "0") * 100));
  var titleBad = title.length > 0 && title.length < 8;
  var when = formatWhen(whenDate, whenTime);
  var errors = {
    title: title.length < 8 ? "Give it a few more words so doers know what's involved" : null,
    budget: budgetMinor <= 0 ? "Add a budget so doers know what's on offer" : null,
    address: address.trim() === "" ? "Add an address so doers know the distance" : null,
    when: !whenDate || !whenTime ? "Pick a date and time" : null
  };
  var valid = !errors.title && !errors.budget && !errors.address && !errors.when;
  function submit() {
    setTried(true);
    if (!valid) return;
    props.onPost({
      title: title,
      categoryId: cat,
      payoutMinor: budgetMinor,
      details: details,
      addressLine: address,
      when: when,
      urgent: urgent
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "Post a quest",
    subtitle: "Takes about a minute"
  }), /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "What needs doing?",
    placeholder: "Walk my dog for an hour",
    value: title,
    onChange: function (ev) {
      setTitle(ev.target.value);
    },
    hint: titleBad || tried && errors.title ? undefined : "Be specific — clear quests get taken faster",
    error: titleBad || tried && errors.title ? errors.title : undefined
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Details",
    multiline: true,
    rows: 3,
    value: details,
    onChange: function (ev) {
      setDetails(ev.target.value);
    },
    placeholder: "Anything a stranger would need to know: access, tools, timing."
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Category",
    options: D.categories.slice(1).map(function (x) {
      return {
        value: x.id,
        label: x.label
      };
    }),
    value: cat,
    onChange: function (ev) {
      setCat(ev.target.value);
    }
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, "Where & when"), /*#__PURE__*/React.createElement(Input, {
    label: "Address",
    icon: "map-pin",
    placeholder: "Yongkang St, Da'an District",
    value: address,
    onChange: function (ev) {
      setAddress(ev.target.value);
    },
    error: tried && errors.address ? errors.address : undefined
  }), /*#__PURE__*/React.createElement(PickerField, {
    label: "Date",
    icon: "calendar",
    value: formatDateLabel(whenDate),
    placeholder: "Choose a date",
    error: tried && errors.when && !whenDate ? errors.when : undefined,
    onClick: function () {
      setDateSheet(true);
    }
  }), /*#__PURE__*/React.createElement(PickerField, {
    label: "Time",
    icon: "clock",
    value: whenTime ? formatTime12(whenTime) : "",
    placeholder: "Choose a time",
    error: tried && errors.when && !whenTime ? errors.when : undefined,
    onClick: function () {
      setTimeSheet(true);
    }
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Needs doing urgently",
    description: "Shows an 'ends soon' badge to nearby doers",
    checked: urgent,
    onChange: function () {
      setUrgent(!urgent);
    }
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, "What's it worth"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, [20000, 30000, 40000, 60000].map(function (p) {
    return /*#__PURE__*/React.createElement(Tag, {
      key: p,
      selected: budgetMinor === p,
      onSelect: function () {
        setBudget(String(p / 100));
      }
    }, formatMoney(p));
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Or set your own",
    prefix: "NT$",
    value: budget,
    onChange: function (ev) {
      setBudget(ev.target.value.replace(/[^0-9.]/g, ""));
    },
    error: tried && errors.budget ? errors.budget : undefined
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 14px",
      background: "var(--coin-100)",
      border: "var(--border-hair) solid var(--coin-600)",
      borderRadius: "var(--radius-card-inner)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      flex: 1
    }
  }, "We hold the money until you mark the quest done. Nothing leaves your wallet before that.")))), /*#__PURE__*/React.createElement(Dialog, {
    open: dateSheet,
    onClose: function () {
      setDateSheet(false);
    },
    title: "Pick a date",
    actions: /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: function () {
        if (!whenDate) setWhenDate(D.now.slice(0, 10));
        setDateSheet(false);
      }
    }, "Done")
  }, /*#__PURE__*/React.createElement(MonthCalendarPicker, {
    value: whenDate,
    minISO: D.now.slice(0, 10),
    onChange: function (iso) {
      setWhenDate(iso);
    }
  })), /*#__PURE__*/React.createElement(Dialog, {
    open: timeSheet,
    onClose: function () {
      setTimeSheet(false);
    },
    title: "Pick a time",
    actions: /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: function () {
        setTimeSheet(false);
      }
    }, "Done")
  }, /*#__PURE__*/React.createElement(TimeWheelPicker, {
    value: whenTime || "18:00",
    onChange: function (t) {
      setWhenTime(t);
    }
  })), /*#__PURE__*/React.createElement(Slab, null, /*#__PURE__*/React.createElement(RewardPill, {
    amount: formatMoney(budgetMinor)
  }), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    fullWidth: true,
    icon: "plus",
    onClick: submit
  }, "Post quest")));
}

/* ---------------- Chats & offers ---------------- */

function ChatsScreen(props) {
  var app = props.app;
  var a = React.useState(props.initialTab || "chats");
  var tab = a[0],
    setTab = a[1];
  var b = React.useState(null);
  var open = b[0],
    setOpen = b[1];
  var c = React.useState("");
  var draft = c[0],
    setDraft = c[1];
  var thread = null;
  for (var i = 0; i < app.threads.length; i++) if (app.threads[i].id === open) thread = app.threads[i];
  function send() {
    if (!draft.trim()) return;
    var next = Object.assign({}, app.messages);
    next[thread.id] = (next[thread.id] || []).concat([{
      id: thread.id + "-" + Date.now(),
      from: "me",
      text: draft,
      time: "now"
    }]);
    app.setMessages(next);
    setDraft("");
  }
  if (thread) {
    var u = userOf(thread.withUserId);
    var msgs = app.messages[thread.id] || [];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement(TopBar, {
      title: u.name,
      subtitle: thread.questTitle,
      onBack: function () {
        setOpen(null);
      },
      actions: /*#__PURE__*/React.createElement(IconButton, {
        icon: "more-horizontal",
        label: "Options",
        size: "sm"
      })
    }), /*#__PURE__*/React.createElement(Card, {
      variant: "flat",
      padding: "sm",
      style: {
        borderRadius: 0,
        borderLeft: "none",
        borderRight: "none",
        borderTop: "none",
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(StatusTrack, {
      current: thread.step - 1,
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(RewardPill, {
      amount: formatMoney(thread.amountMinor),
      unit: null,
      tone: "quiet"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "screen-body",
      style: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "16px var(--gutter-screen)",
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, msgs.map(function (m) {
      var mine = m.from === "me";
      return /*#__PURE__*/React.createElement("div", {
        key: m.id,
        style: {
          display: "flex",
          justifyContent: mine ? "flex-end" : "flex-start",
          gap: 8
        }
      }, mine ? null : /*#__PURE__*/React.createElement(Avatar, {
        name: u.name,
        size: "sm"
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          maxWidth: "76%",
          padding: "10px 13px",
          background: mine ? "var(--lime-500)" : "var(--paper-000)",
          border: "var(--border-width) solid var(--border-strong)",
          borderRadius: mine ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
          boxShadow: "var(--shadow-sticker-sm)"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-normal)"
        }
      }, m.text), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          opacity: 0.55,
          marginTop: 3,
          textAlign: "right"
        }
      }, m.time)));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px var(--gutter-screen)",
        background: "var(--paper-000)",
        borderTop: "var(--border-width) solid var(--border-strong)",
        display: "flex",
        gap: 8,
        alignItems: "center",
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Message",
      value: draft,
      onChange: function (ev) {
        setDraft(ev.target.value);
      }
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "send",
      label: "Send",
      variant: "primary",
      onClick: send
    })));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "Chats & offers",
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: "search",
      label: "Search",
      size: "sm"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px var(--gutter-screen) 0",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      value: "chats",
      label: "Chats",
      count: app.threads.length
    }, {
      value: "offers",
      label: "My quests",
      count: app.myQuests.length
    }]
  })), /*#__PURE__*/React.createElement(Body, {
    style: {
      paddingTop: 12,
      gap: 10
    }
  }, tab === "chats" ? app.threads.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    title: "No conversations yet \u2014 take a quest and the chat opens itself.",
    action: "Browse quests",
    onAction: props.onBrowse
  }) : app.threads.map(function (t) {
    var cu = userOf(t.withUserId);
    var last = (app.messages[t.id] || [])[(app.messages[t.id] || []).length - 1];
    return /*#__PURE__*/React.createElement(Card, {
      key: t.id,
      padding: "sm",
      onClick: function () {
        setOpen(t.id);
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(UserChip, {
      name: cu.name,
      rating: cu.rating,
      quests: cu.questsCompleted,
      verified: cu.verified,
      size: "md",
      style: {
        flex: 1,
        minWidth: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        color: "var(--ink-400)"
      }
    }, t.time), t.unread ? /*#__PURE__*/React.createElement(Badge, {
      tone: "hot",
      size: "sm"
    }, t.unread, " new") : null)), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingTop: 8,
        borderTop: "var(--border-hair) solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginBottom: 2
      }
    }, t.questTitle), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: t.unread ? "var(--weight-semibold)" : "var(--weight-regular)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, last ? last.text : "Offer sent — waiting to hear back")));
  }) : app.myQuests.map(function (m) {
    var cu = userOf(m.counterpartId);
    return /*#__PURE__*/React.createElement(Card, {
      key: m.id,
      padding: "md"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: m.role === "doing" ? "accent" : "neutral",
      size: "sm"
    }, m.role === "doing" ? "You're doing this" : "You posted this"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--weight-bold) var(--text-md)/1.25 var(--font-display)",
        marginTop: 6
      }
    }, m.title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 5,
        marginTop: 4,
        fontSize: "var(--text-2xs)",
        color: "var(--text-secondary)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 13,
      strokeWidth: 2
    }), m.when)), /*#__PURE__*/React.createElement(RewardPill, {
      amount: formatMoney(m.payoutMinor),
      unit: null
    })), /*#__PURE__*/React.createElement(StatusTrack, {
      current: m.step - 1
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        paddingTop: 10,
        borderTop: "var(--border-hair) solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement(UserChip, {
      name: cu.name,
      rating: cu.rating,
      quests: cu.questsCompleted,
      verified: cu.verified,
      size: "sm",
      style: {
        flex: 1
      }
    }), m.step >= 2 && m.step < 3 ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "primary",
      icon: "check",
      onClick: function () {
        props.onMarkDone(m);
      }
    }, "Mark as done") : /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary"
    }, "Message")));
  })));
}

/* ---------------- Wallet ---------------- */

var PROFILE_AREAS = ["Da'an", "Zhongshan", "Songshan", "Xinyi", "Nangang", "Wenshan"];
function ProfileScreen(props) {
  var app = props.app;
  var b = React.useState(false);
  var sheet = b[0],
    setSheet = b[1];
  var st = React.useState(false);
  var settingsOpen = st[0],
    setSettingsOpen = st[1];
  var c = React.useState("1500");
  var amount = c[0],
    setAmount = c[1];
  var e = React.useState(true);
  var nearby = e[0],
    setNearby = e[1];
  var f = React.useState(false);
  var weekly = f[0],
    setWeekly = f[1];
  var g = React.useState(false);
  var auto = g[0],
    setAuto = g[1];
  var ph = React.useState(D.me.phone || "");
  var phone = ph[0],
    setPhone = ph[1];
  var em = React.useState(D.me.email || "");
  var email = em[0],
    setEmail = em[1];
  var ar = React.useState(D.me.area || "");
  var area = ar[0],
    setArea = ar[1];
  var jl = React.useState(false);
  var justLocated = jl[0],
    setJustLocated = jl[1];
  var cashMinor = Math.max(0, Math.round(parseFloat(amount || "0") * 100));
  var canCash = cashMinor > 0 && cashMinor <= app.available;
  function locateMe() {
    setArea(D.me.area);
    setJustLocated(true);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "Profile",
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: "sliders-horizontal",
      label: "Settings",
      size: "sm",
      onClick: function () {
        setSettingsOpen(true);
      }
    })
  }), /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    variant: "money",
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: D.me.name,
    size: "xl",
    verified: D.me.verified
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--weight-black) var(--text-xl)/1.15 var(--font-display)",
      letterSpacing: "var(--tracking-heading)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, D.me.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)",
      marginTop: 2
    }
  }, D.me.area, " \xB7 ", D.me.questsCompleted, " quests"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      flex: "none",
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 18,
    filled: true,
    color: "var(--coin-500)",
    strokeWidth: 2,
    style: {
      transform: "rotate(-12deg)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-black) var(--text-md)/1 var(--font-display)",
      fontFeatureSettings: "'tnum' 1"
    }
  }, D.me.rating.toFixed(1)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--card-gap)",
      marginTop: 4,
      paddingTop: 16,
      borderTop: "var(--border-hair) solid var(--border-strong)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-bold) var(--text-2xs)/1 var(--font-text)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase"
    }
  }, "Available"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--weight-black) var(--text-4xl)/1 var(--font-display)",
      letterSpacing: "var(--tracking-display)",
      fontFeatureSettings: "'tnum' 1"
    }
  }, formatMoney(app.available)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 15
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      flex: 1
    }
  }, formatMoney(app.held), " held — released when quests are marked done")), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    fullWidth: true,
    icon: "wallet",
    onClick: function () {
      setSheet(true);
    }
  }, "Cash out"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, "Activity"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      color: "var(--text-secondary)"
    }
  }, formatMoney(D.me.monthEarnedMinor), " this month \xB7 ", D.me.monthQuests, " done")), app.ledger.map(function (l) {
    var out = l.amountMinor < 0;
    return /*#__PURE__*/React.createElement(Card, {
      key: l.id,
      variant: "flat",
      padding: "sm"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        placeItems: "center",
        width: 36,
        height: 36,
        flex: "none",
        background: out ? "var(--paper-200)" : l.state === "held" ? "var(--coin-200)" : "var(--success-200)",
        border: "var(--border-hair) solid var(--border-strong)",
        borderRadius: "var(--radius-pill)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: out ? "arrow-right" : l.state === "held" ? "lock" : "check",
      size: 16,
      strokeWidth: 2.25
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-semibold)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, l.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-2xs)",
        color: "var(--text-secondary)"
      }
    }, l.account ? l.account : userOf(l.counterpartId) ? userOf(l.counterpartId).name : "")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--weight-black) var(--text-md)/1 var(--font-display)",
        fontFeatureSettings: "'tnum' 1"
      }
    }, (l.amountMinor > 0 ? "+" : "") + formatMoney(l.amountMinor)), /*#__PURE__*/React.createElement(Badge, {
      tone: l.tone,
      size: "sm",
      style: {
        marginTop: 4
      }
    }, l.state === "held" ? "Held until done" : l.state === "paid" ? "Paid" : "Sent"))));
  })), /*#__PURE__*/React.createElement(Dialog, {
    open: sheet,
    onClose: function () {
      setSheet(false);
    },
    title: "Cash out",
    subtitle: formatMoney(app.available) + " available",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: function () {
        setSheet(false);
      }
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      disabled: !canCash,
      onClick: function () {
        setSheet(false);
        props.onCashOut(cashMinor);
      }
    }, "Send " + formatMoney(cashMinor)))
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Amount",
    prefix: "NT$",
    value: amount,
    onChange: function (ev) {
      setAmount(ev.target.value.replace(/[^0-9.]/g, ""));
    },
    hint: canCash ? "Arrives in 1–2 working days" : undefined,
    error: !canCash && cashMinor > 0 ? "That's more than you have available" : undefined
  }), /*#__PURE__*/React.createElement(Card, {
    variant: "flat",
    padding: "sm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "credit-card",
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)"
    }
  }, D.me.bank), /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16,
    strokeWidth: 2.5
  })))), /*#__PURE__*/React.createElement(Dialog, {
    open: settingsOpen,
    onClose: function () {
      setSettingsOpen(false);
    },
    title: "Settings",
    subtitle: "Notifications, account, location and verification"
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, "Notifications"), /*#__PURE__*/React.createElement(Switch, {
    label: "Quests near me",
    description: "Ping me when something lands within 2 km",
    checked: nearby,
    onChange: function () {
      setNearby(!nearby);
    }
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Weekly earnings summary",
    checked: weekly,
    onChange: function () {
      setWeekly(!weekly);
    }
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Auto cash-out every Friday",
    checked: auto,
    onChange: function () {
      setAuto(!auto);
    }
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, "Account"), /*#__PURE__*/React.createElement(Input, {
    label: "Phone number",
    value: phone,
    onChange: function (ev) {
      setPhone(ev.target.value);
    },
    placeholder: "Add a phone number"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    value: email,
    onChange: function (ev) {
      setEmail(ev.target.value);
    },
    placeholder: "Add an email"
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, "Location"), /*#__PURE__*/React.createElement(Select, {
    label: "Area",
    value: area,
    onChange: function (ev) {
      setJustLocated(false);
      setArea(ev.target.value);
    },
    options: PROFILE_AREAS,
    hint: justLocated ? "Detected: " + area : "Quests in your feed are matched against this area."
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "map-pin",
    onClick: locateMe
  }, "Locate me")), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, "Verification"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: D.me.verified ? "shield-check" : "alert-triangle",
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: "var(--text-sm)"
    }
  }, D.me.verified ? "Your identity is verified" : "Verify your identity to build trust with posters"), /*#__PURE__*/React.createElement(Badge, {
    tone: D.me.verified ? "success" : "warning",
    size: "sm"
  }, D.me.verified ? "Verified" : "Not verified")), !D.me.verified ? /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    icon: "shield-check",
    style: {
      marginTop: 10
    }
  }, "Verify identity") : null), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: SECTION_LABEL
  }, "Payment method"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "credit-card",
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)"
    }
  }, D.me.bank), /*#__PURE__*/React.createElement(Badge, {
    tone: "success",
    size: "sm"
  }, "Default")))));
}

/* ---------------- Prototype shell ---------------- */

var TABS = [{
  value: "browse",
  label: "Browse",
  icon: "search"
}, {
  value: "quests",
  label: "My quests",
  icon: "list-checks",
  badge: 2
}, {
  value: "post",
  label: "Post",
  icon: "plus"
}, {
  value: "chats",
  label: "Chats",
  icon: "message-circle",
  badge: 2
}, {
  value: "profile",
  label: "Profile",
  icon: "user"
}];
function Prototype() {
  var app = useApp();
  var a = React.useState("browse");
  var tab = a[0],
    setTab = a[1];
  var b = React.useState(null);
  var questId = b[0],
    setQuestId = b[1];
  var c = React.useState(null);
  var toast = c[0],
    setToast = c[1];
  var timer = React.useRef(null);
  function flash(tone, text) {
    setToast({
      tone: tone,
      text: text
    });
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(function () {
      setToast(null);
    }, 3400);
  }
  React.useEffect(function () {
    return function () {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);
  function toggleSave(id) {
    var on = app.saved.indexOf(id) > -1;
    app.setSaved(on ? app.saved.filter(function (x) {
      return x !== id;
    }) : app.saved.concat([id]));
    flash("neutral", on ? "Removed from saved" : "Quest saved");
  }
  function makeOffer(quest, amountMinor, note) {
    var u = userOf(quest.posterId);
    var tid = "t-" + quest.id;
    var exists = app.threads.some(function (t) {
      return t.id === tid;
    });
    if (!exists) {
      app.setThreads([{
        id: tid,
        questId: quest.id,
        questTitle: quest.title,
        withUserId: quest.posterId,
        amountMinor: amountMinor,
        step: 0,
        unread: 0,
        time: "now"
      }].concat(app.threads));
      var next = Object.assign({}, app.messages);
      next[tid] = [{
        id: tid + "-1",
        from: "me",
        text: note && note.trim() ? note.trim() : "I'd like to take this on at " + formatMoney(amountMinor) + ".",
        time: "now"
      }];
      app.setMessages(next);
    }
    setQuestId(null);
    setTab("chats");
    flash("success", "Offer sent — " + u.name + " usually replies in 10 min");
  }
  function postQuest(form) {
    var id = "q" + (app.quests.length + 1) + "-" + Date.now();
    var quest = {
      id: id,
      posterId: D.me.id,
      title: form.title,
      payoutMinor: form.payoutMinor,
      payoutUnit: "fixed",
      categoryId: form.categoryId,
      distanceM: 0,
      estimatedMinutes: 60,
      scheduledFor: D.now,
      when: form.when,
      expiresAt: D.now,
      status: "open",
      offersCount: 0,
      addressLine: form.addressLine,
      area: form.addressLine,
      badges: form.urgent ? [{
        label: "Ends soon",
        tone: "hot",
        icon: "clock"
      }] : [{
        label: "New",
        tone: "accent"
      }],
      details: form.details || "No extra details yet.",
      requirements: []
    };
    app.setQuests([quest].concat(app.quests));
    app.setMyQuests([{
      id: "m-" + id,
      questId: id,
      title: form.title,
      payoutMinor: form.payoutMinor,
      categoryId: form.categoryId,
      step: 0,
      role: "posted",
      when: form.when,
      counterpartId: "u1"
    }].concat(app.myQuests));
    setTab("quests");
    flash("success", "Quest posted — doers nearby can see it now");
  }
  function markDone(m) {
    app.setMyQuests(app.myQuests.map(function (x) {
      return x.id === m.id ? Object.assign({}, x, {
        step: 3
      }) : x;
    }));
    var released = 0;
    app.setLedger(app.ledger.map(function (l) {
      if (l.questId && l.questId === m.questId && l.state === "held") {
        released = l.amountMinor;
        return Object.assign({}, l, {
          state: "paid",
          tone: "success"
        });
      }
      return l;
    }));
    if (released) app.setAvailable(app.available + released);
    app.setThreads(app.threads.map(function (t) {
      return t.questId === m.questId ? Object.assign({}, t, {
        step: 3
      }) : t;
    }));
    flash("money", released ? formatMoney(released) + " released to your wallet" : "Marked as done");
  }
  function cashOut(minor) {
    app.setAvailable(app.available - minor);
    app.setLedger([{
      id: "L-" + Date.now(),
      questId: null,
      counterpartId: null,
      label: "Cash out to bank",
      amountMinor: -minor,
      state: "sent",
      tone: "neutral",
      account: D.me.bank
    }].concat(app.ledger));
    flash("money", formatMoney(minor) + " is on its way to your bank");
  }
  var quest = null;
  for (var i = 0; i < app.quests.length; i++) if (app.quests[i].id === questId) quest = app.quests[i];
  var screen;
  if (quest) {
    screen = /*#__PURE__*/React.createElement(QuestDetailScreen, {
      quest: quest,
      app: app,
      onBack: function () {
        setQuestId(null);
      },
      onToggleSave: toggleSave,
      onOffer: makeOffer
    });
  } else if (tab === "browse") {
    screen = /*#__PURE__*/React.createElement(BrowseScreen, {
      app: app,
      onOpen: setQuestId,
      onToggleSave: toggleSave
    });
  } else if (tab === "post") {
    screen = /*#__PURE__*/React.createElement(PostQuestScreen, {
      app: app,
      onPost: postQuest
    });
  } else if (tab === "profile") {
    screen = /*#__PURE__*/React.createElement(ProfileScreen, {
      app: app,
      onCashOut: cashOut
    });
  } else {
    screen = /*#__PURE__*/React.createElement(ChatsScreen, {
      key: tab,
      app: app,
      initialTab: tab === "quests" ? "offers" : "chats",
      onMarkDone: markDone,
      onBrowse: function () {
        setTab("browse");
      }
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "frame"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, screen), toast ? /*#__PURE__*/React.createElement("div", {
    className: "toasts"
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: toast.tone
  }, toast.text)) : null, /*#__PURE__*/React.createElement(TabBar, {
    items: TABS,
    value: quest ? "browse" : tab,
    onChange: function (v) {
      setQuestId(null);
      setTab(v);
    }
  }));
}

/* ==== 03-galleries.jsx ==== */
/* YouDO M0 preview — galleries and page shell. */

/* Token values are read from the live CSS custom properties, so what's shown
   here is whatever tokens/*.css actually declares — never a re-typed copy. */
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
  return /*#__PURE__*/React.createElement("div", {
    className: "stack"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "The three states the exported kit never had"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-normal)",
      color: "var(--ink-700)",
      maxWidth: "62ch"
    }
  }, "The prototype shipped exactly one empty state across five screens, and no loading or error state anywhere. These are new design work \u2014 worth your eye before they get built in M0. Loading is a sunken card with a line of text: the system bans skeleton shimmer."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 18,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(MiniFrame, {
    label: "Loading",
    note: "A sunken card carrying a line of honest text \u2014 no shimmer, no spinner."
  }, /*#__PURE__*/React.createElement(LoadingState, null)), /*#__PURE__*/React.createElement(MiniFrame, {
    label: "Empty \u2014 nothing nearby",
    note: "Names the next action rather than reporting the emptiness."
  }, /*#__PURE__*/React.createElement(EmptyState, {
    title: "Nothing near you right now \u2014 widen the radius to 10 km?",
    action: "Widen search",
    onAction: function () {}
  })), /*#__PURE__*/React.createElement(MiniFrame, {
    label: "Empty \u2014 filtered out",
    note: "Different cause, different copy, and a way back out."
  }, /*#__PURE__*/React.createElement(EmptyState, {
    title: "Nothing matches that yet \u2014 widen the radius or clear the filters?",
    action: "Clear filters",
    onAction: function () {}
  })), /*#__PURE__*/React.createElement(MiniFrame, {
    label: "Error",
    note: "Written as a fix, not a scold. Nothing apologises twice."
  }, /*#__PURE__*/React.createElement(ErrorState, {
    onRetry: function () {}
  })), /*#__PURE__*/React.createElement(MiniFrame, {
    label: "Empty \u2014 no chats",
    note: "Points at the action that creates the first thread."
  }, /*#__PURE__*/React.createElement(EmptyState, {
    title: "No conversations yet \u2014 take a quest and the chat opens itself.",
    action: "Browse quests",
    onAction: function () {}
  })), /*#__PURE__*/React.createElement(MiniFrame, {
    label: "Empty \u2014 wallet",
    note: "A zero balance is an invitation, not a dead end."
  }, /*#__PURE__*/React.createElement(EmptyState, {
    title: "No activity yet \u2014 your first payout lands here.",
    action: "Find a quest",
    onAction: function () {}
  })))));
}

/* ---------------- Page shell ---------------- */

var VIEWS = [{
  value: "prototype",
  label: "Prototype"
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
  }, view === "prototype" ? /*#__PURE__*/React.createElement(Prototype, null) : null, view === "components" ? /*#__PURE__*/React.createElement(ComponentsTab, null) : null, view === "tokens" ? /*#__PURE__*/React.createElement(TokensTab, {
    typeScale: typeScale,
    setTypeScale: setTypeScale
  }) : null, view === "states" ? /*#__PURE__*/React.createElement(StatesTab, null) : null));
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
