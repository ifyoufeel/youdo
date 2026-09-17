/* @ds-bundle: {"format":4,"namespace":"YouDODesignSystem_ea424c","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"},{"name":"QuestCard","sourcePath":"components/quests/QuestCard.jsx"},{"name":"RewardPill","sourcePath":"components/quests/RewardPill.jsx"},{"name":"StatusTrack","sourcePath":"components/quests/StatusTrack.jsx"},{"name":"UserChip","sourcePath":"components/quests/UserChip.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"Dialog","sourcePath":"components/surfaces/Dialog.jsx"},{"name":"Toast","sourcePath":"components/surfaces/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/surfaces/Tooltip.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"5624efc05b0a","components/core/Badge.jsx":"9d6558551244","components/core/Button.jsx":"847d3619e4f3","components/core/Icon.jsx":"e1b9231e9699","components/core/IconButton.jsx":"e1dd19d8eec7","components/core/Tag.jsx":"18e3ce968730","components/forms/Checkbox.jsx":"0e8437d0f6b2","components/forms/Input.jsx":"90b50e5711a1","components/forms/Radio.jsx":"4bf661dc1ee4","components/forms/Select.jsx":"37ff4d1e2b07","components/forms/Switch.jsx":"a7eccb360b66","components/navigation/TabBar.jsx":"3c9671484693","components/navigation/Tabs.jsx":"e0c0e471dbb3","components/navigation/TopBar.jsx":"c178d2b5afbe","components/quests/QuestCard.jsx":"e9d9d6c882f5","components/quests/RewardPill.jsx":"6686307a3449","components/quests/StatusTrack.jsx":"9b1d0d8606c9","components/quests/UserChip.jsx":"2a6d12cf7b3a","components/surfaces/Card.jsx":"71c7afed1e5c","components/surfaces/Dialog.jsx":"79dd4854b68c","components/surfaces/Toast.jsx":"b43e75204955","components/surfaces/Tooltip.jsx":"46ecba3bb95a","ui_kits/app/BrowseScreen.jsx":"df30c449c283","ui_kits/app/ChatsScreen.jsx":"66cc75ac420a","ui_kits/app/PostQuestScreen.jsx":"4e68b49f8b2b","ui_kits/app/QuestDetailScreen.jsx":"4325d7cd997d","ui_kits/app/WalletScreen.jsx":"09ce78778bcd","ui_kits/app/data.js":"39073c600506"},"inlinedExternals":[],"unexposedExports":[{"name":"iconNames","sourcePath":"components/core/Icon.jsx"}]}*/

(() => {

const __ds_ns = (window.YouDODesignSystem_ea424c = window.YouDODesignSystem_ea424c || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Icon geometry is a hand-picked subset of Lucide (ISC/MIT licensed), redrawn on
   Lucide's 24x24 / round-cap grid. No icon assets shipped with the brief — see
   readme.md > ICONOGRAPHY for the substitution note. */
const P = {
  search: [["circle", 11, 11, 8], ["path", "m21 21-4.3-4.3"]],
  plus: [["path", "M5 12h14"], ["path", "M12 5v14"]],
  x: [["path", "M18 6 6 18"], ["path", "m6 6 12 12"]],
  check: [["path", "M20 6 9 17l-5-5"]],
  "check-circle": [["circle", 12, 12, 10], ["path", "m8.5 12.5 2.5 2.5 4.5-5"]],
  "map-pin": [["path", "M20 10c0 4.4-5.2 9.6-7.3 11.5a1 1 0 0 1-1.4 0C9.2 19.6 4 14.4 4 10a8 8 0 0 1 16 0z"], ["circle", 12, 10, 3]],
  map: [["path", "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"], ["path", "M9 3v15"], ["path", "M15 6v15"]],
  clock: [["circle", 12, 12, 10], ["path", "M12 6.5V12l4 2"]],
  calendar: [["rect", 3, 4, 18, 18, 2], ["path", "M8 2v4"], ["path", "M16 2v4"], ["path", "M3 10h18"]],
  star: [["path", "M11.5 3.1a.6.6 0 0 1 1 0l2.3 4.7 5.2.8a.6.6 0 0 1 .3 1l-3.7 3.6.9 5.2a.6.6 0 0 1-.9.6L12 16.6l-4.6 2.5a.6.6 0 0 1-.9-.7l.9-5.2-3.7-3.6a.6.6 0 0 1 .3-1l5.2-.8z"]],
  heart: [["path", "M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"]],
  wallet: [["path", "M3 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1"], ["path", "M3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2"], ["path", "M17 13h.01"]],
  coins: [["circle", 8, 8, 6], ["path", "M18.1 10.4a6 6 0 1 1-8.5 8.4"], ["path", "M7 6h1v4"], ["path", "M6.7 10h2.6"]],
  "credit-card": [["rect", 2, 5, 20, 14, 2], ["path", "M2 10h20"]],
  briefcase: [["rect", 2, 7, 20, 14, 2], ["path", "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"]],
  package: [["path", "M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"], ["path", "m3.3 7 8.7 5 8.7-5"], ["path", "M12 22V12"]],
  "chevron-right": [["path", "m9 18 6-6-6-6"]],
  "chevron-left": [["path", "m15 18-6-6 6-6"]],
  "chevron-down": [["path", "m6 9 6 6 6-6"]],
  "chevron-up": [["path", "m18 15-6-6-6 6"]],
  "arrow-right": [["path", "M5 12h14"], ["path", "m12 5 7 7-7 7"]],
  "arrow-left": [["path", "M19 12H5"], ["path", "m12 19-7-7 7-7"]],
  "message-circle": [["path", "M7.9 20A9 9 0 1 0 4 16.1L2 22z"]],
  "message-square": [["path", "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"]],
  send: [["path", "M22 2 11 13"], ["path", "M22 2l-7 20-4-9-9-4z"]],
  bell: [["path", "M10.3 21a1.9 1.9 0 0 0 3.4 0"], ["path", "M4 17h16a2 2 0 0 1-2-2v-4a6 6 0 1 0-12 0v4a2 2 0 0 1-2 2z"]],
  user: [["path", "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"], ["circle", 12, 7, 4]],
  users: [["path", "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"], ["circle", 9, 7, 4], ["path", "M22 21v-2a4 4 0 0 0-3-3.9"], ["path", "M16 3.1a4 4 0 0 1 0 7.8"]],
  "sliders-horizontal": [["path", "M21 4h-6"], ["path", "M10 4H3"], ["path", "M21 12h-8"], ["path", "M8 12H3"], ["path", "M21 20h-4"], ["path", "M12 20H3"], ["circle", 12.5, 4, 2], ["circle", 10.5, 12, 2], ["circle", 14.5, 20, 2]],
  filter: [["path", "M3 4h18l-7 8v7l-4 2v-9z"]],
  home: [["path", "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"]],
  "list-checks": [["path", "M11 6h10"], ["path", "M11 12h10"], ["path", "M11 18h10"], ["path", "m3 6 1.5 1.5L7 4"], ["path", "m3 16 1.5 1.5L7 14"]],
  "shield-check": [["path", "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"], ["path", "m9 12 2 2 4-4"]],
  zap: [["path", "M13 2 3 14h9l-1 8 10-12h-9z"]],
  sparkles: [["path", "m12 3 1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"], ["path", "M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"]],
  "thumbs-up": [["path", "M7 10v11"], ["path", "M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.1 6.9A2 2 0 0 1 18.7 21H7V10h1.8a2 2 0 0 0 1.8-1.1L13 4a2.4 2.4 0 0 1 2 1.9z"]],
  camera: [["path", "M14.5 4h-5L8 6.5H4a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-4z"], ["circle", 12, 13, 3.2]],
  image: [["rect", 3, 3, 18, 18, 2], ["circle", 8.5, 8.5, 1.5], ["path", "m21 15-5-5L5 21"]],
  pencil: [["path", "M12 20h9"], ["path", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"]],
  trash: [["path", "M3 6h18"], ["path", "M8 6V4h8v2"], ["path", "M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"]],
  eye: [["path", "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"], ["circle", 12, 12, 3]],
  lock: [["rect", 3, 11, 18, 11, 2], ["path", "M7 11V7a5 5 0 0 1 10 0v4"]],
  info: [["circle", 12, 12, 10], ["path", "M12 16.5V11"], ["path", "M12 8h.01"]],
  "alert-triangle": [["path", "m10.3 3.6-8 14A2 2 0 0 0 4 20.5h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0z"], ["path", "M12 9v4"], ["path", "M12 17h.01"]],
  flag: [["path", "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z"], ["path", "M4 22v-7"]],
  share: [["path", "M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"], ["path", "m16 6-4-4-4 4"], ["path", "M12 2v13"]],
  "more-horizontal": [["circle", 5, 12, 1], ["circle", 12, 12, 1], ["circle", 19, 12, 1]]
};
function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  filled = false,
  color = "currentColor",
  style,
  ...rest
}) {
  const shapes = P[name];
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: filled ? color : "none",
    stroke: filled ? "none" : color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": rest["aria-label"] ? undefined : true,
    style: {
      display: "block",
      flex: "none",
      ...style
    }
  }, rest), (shapes || []).map((s, i) => s[0] === "circle" ? /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: s[1],
    cy: s[2],
    r: s[3]
  }) : s[0] === "rect" ? /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: s[1],
    y: s[2],
    width: s[3],
    height: s[4],
    rx: s[5]
  }) : /*#__PURE__*/React.createElement("path", {
    key: i,
    d: s[1]
  })));
}
const iconNames = Object.keys(P);
Object.assign(__ds_scope, { Icon, iconNames });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80
};
const TINTS = ["var(--lime-300)", "var(--coin-300)", "var(--flare-300)", "var(--info-200)", "var(--success-200)"];
function Avatar({
  name = "",
  src,
  size = "md",
  verified = false,
  tone,
  style,
  ...rest
}) {
  const d = SIZES[size] || SIZES.md;
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase();
  const tint = tone || TINTS[(name.charCodeAt(0) || 0) % TINTS.length];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: "relative",
      display: "inline-block",
      width: d,
      height: d,
      flex: "none",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "grid",
      placeItems: "center",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      background: src ? "var(--paper-200)" : tint,
      border: "var(--border-width) solid var(--border-strong)",
      borderRadius: "var(--radius-avatar)",
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-bold)",
      fontSize: Math.round(d * 0.38),
      color: "var(--ink-900)",
      letterSpacing: "-0.02em"
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials), verified ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: -2,
      bottom: -2,
      display: "grid",
      placeItems: "center",
      width: Math.max(14, Math.round(d * 0.34)),
      height: Math.max(14, Math.round(d * 0.34)),
      background: "var(--lime-500)",
      color: "var(--ink-900)",
      border: "var(--border-width) solid var(--border-strong)",
      borderRadius: "var(--radius-pill)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: Math.max(8, Math.round(d * 0.2)),
    strokeWidth: 2.25
  })) : null);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: "var(--paper-200)",
    fg: "var(--ink-800)"
  },
  accent: {
    bg: "var(--lime-500)",
    fg: "var(--ink-900)"
  },
  money: {
    bg: "var(--coin-500)",
    fg: "var(--ink-900)"
  },
  hot: {
    bg: "var(--flare-500)",
    fg: "var(--ink-900)"
  },
  success: {
    bg: "var(--success-200)",
    fg: "var(--success-600)"
  },
  warning: {
    bg: "var(--warning-200)",
    fg: "var(--warning-600)"
  },
  danger: {
    bg: "var(--danger-200)",
    fg: "var(--danger-600)"
  },
  info: {
    bg: "var(--info-200)",
    fg: "var(--info-600)"
  },
  ink: {
    bg: "var(--ink-900)",
    fg: "var(--paper-050)"
  }
};
function Badge({
  children,
  tone = "neutral",
  icon,
  outlined = true,
  size = "md",
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  const sm = size === "sm";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: sm ? 4 : 5,
      height: sm ? 20 : 24,
      padding: sm ? "0 7px" : "0 9px",
      background: t.bg,
      color: t.fg,
      border: outlined ? "var(--border-hair) solid var(--border-strong)" : "none",
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-text)",
      fontSize: sm ? "var(--text-3xs)" : "var(--text-2xs)",
      fontWeight: "var(--weight-bold)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      lineHeight: 1,
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: sm ? 11 : 13,
    strokeWidth: 2.25
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VARIANTS = {
  primary: {
    bg: "var(--action-primary-bg)",
    bgHover: "var(--action-primary-bg-hover)",
    fg: "var(--action-primary-fg)",
    border: "var(--border-strong)",
    shadow: true
  },
  secondary: {
    bg: "var(--action-secondary-bg)",
    bgHover: "var(--action-secondary-bg-hover)",
    fg: "var(--action-secondary-fg)",
    border: "var(--border-strong)",
    shadow: true
  },
  inverse: {
    bg: "var(--action-inverse-bg)",
    bgHover: "var(--action-inverse-bg-hover)",
    fg: "var(--action-inverse-fg)",
    border: "var(--border-strong)",
    shadow: true
  },
  money: {
    bg: "var(--surface-money)",
    bgHover: "var(--coin-600)",
    fg: "var(--ink-900)",
    border: "var(--border-strong)",
    shadow: true
  },
  danger: {
    bg: "var(--action-danger-bg)",
    bgHover: "var(--danger-600)",
    fg: "var(--action-danger-fg)",
    border: "var(--border-strong)",
    shadow: true
  },
  ghost: {
    bg: "transparent",
    bgHover: "var(--paper-200)",
    fg: "var(--text-primary)",
    border: "transparent",
    shadow: false
  }
};
const SIZES = {
  sm: {
    h: "var(--control-height-sm)",
    px: "14px",
    fs: "var(--text-sm)",
    gap: "6px",
    icon: 16
  },
  md: {
    h: "var(--control-height-md)",
    px: "20px",
    fs: "var(--text-md)",
    gap: "8px",
    icon: 18
  },
  lg: {
    h: "var(--control-height-lg)",
    px: "26px",
    fs: "var(--text-lg)",
    gap: "10px",
    icon: 20
  }
};
function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  fullWidth = false,
  disabled = false,
  as = "button",
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const El = as;
  const lift = v.shadow && !disabled;
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: s.gap,
    height: s.h,
    padding: "0 " + s.px,
    width: fullWidth ? "100%" : undefined,
    fontFamily: "var(--font-text)",
    fontSize: s.fs,
    fontWeight: "var(--weight-bold)",
    letterSpacing: "-0.005em",
    lineHeight: 1,
    textDecoration: "none",
    whiteSpace: "nowrap",
    color: disabled ? "var(--action-disabled-fg)" : v.fg,
    background: disabled ? "var(--action-disabled-bg)" : hover && !press ? v.bgHover : v.bg,
    border: "var(--border-width) solid " + (disabled ? "var(--ink-200)" : v.border),
    borderRadius: "var(--radius-control)",
    boxShadow: !lift ? "none" : press ? "var(--shadow-pressed)" : hover ? "var(--shadow-sticker-lg)" : "var(--shadow-sticker)",
    transform: !lift ? "none" : press ? "translate(2px,2px)" : hover ? "translate(-1px,-1px)" : "none",
    transition: "var(--transition-control)",
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none"
  };
  return /*#__PURE__*/React.createElement(El, _extends({
    onClick: disabled ? undefined : onClick,
    disabled: El === "button" ? disabled : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      ...base,
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon,
    strokeWidth: 2
  }) : null, children, iconRight ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.icon,
    strokeWidth: 2
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 36,
  md: 44,
  lg: 52
};
function IconButton({
  icon,
  label,
  variant = "secondary",
  size = "md",
  shape = "circle",
  active = false,
  disabled = false,
  filled = false,
  badge,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const d = SIZES[size] || SIZES.md;
  const outlined = variant !== "ghost";
  const bg = variant === "primary" || active ? "var(--action-primary-bg)" : variant === "inverse" ? "var(--action-inverse-bg)" : variant === "ghost" ? hover ? "var(--paper-200)" : "transparent" : hover && !press ? "var(--paper-100)" : "var(--paper-000)";
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: d,
      height: d,
      flex: "none",
      padding: 0,
      color: variant === "inverse" ? "var(--paper-050)" : disabled ? "var(--text-disabled)" : "var(--ink-900)",
      background: disabled ? "var(--action-disabled-bg)" : bg,
      border: outlined ? "var(--border-width) solid " + (disabled ? "var(--ink-200)" : "var(--border-strong)") : "var(--border-width) solid transparent",
      borderRadius: shape === "circle" ? "var(--radius-pill)" : "var(--radius-field)",
      boxShadow: !outlined || disabled ? "none" : press ? "var(--shadow-pressed)" : hover ? "var(--shadow-sticker-lg)" : "var(--shadow-sticker-sm)",
      transform: !outlined || disabled ? "none" : press ? "translate(2px,2px)" : hover ? "translate(-1px,-1px)" : "none",
      transition: "var(--transition-control)",
      cursor: disabled ? "not-allowed" : "pointer",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === "sm" ? 17 : size === "lg" ? 22 : 20,
    strokeWidth: 2,
    filled: filled
  }), badge ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -3,
      right: -3,
      minWidth: 18,
      height: 18,
      padding: "0 4px",
      display: "grid",
      placeItems: "center",
      background: "var(--flare-500)",
      color: "var(--ink-900)",
      border: "var(--border-width) solid var(--border-strong)",
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-text)",
      fontSize: 11,
      fontWeight: "var(--weight-bold)",
      lineHeight: 1
    }
  }, badge) : null);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  children,
  icon,
  selected = false,
  onSelect,
  onRemove,
  size = "md",
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const interactive = Boolean(onSelect);
  const sm = size === "sm";
  return /*#__PURE__*/React.createElement("span", _extends({
    role: interactive ? "button" : undefined,
    tabIndex: interactive ? 0 : undefined,
    onClick: onSelect,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: sm ? 30 : 36,
      padding: sm ? "0 11px" : "0 14px",
      background: selected ? "var(--ink-900)" : hover && interactive ? "var(--paper-100)" : "var(--paper-000)",
      color: selected ? "var(--paper-050)" : "var(--ink-900)",
      border: "var(--border-width) solid var(--border-strong)",
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-text)",
      fontSize: sm ? "var(--text-xs)" : "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      lineHeight: 1,
      whiteSpace: "nowrap",
      cursor: interactive ? "pointer" : "default",
      transition: "background-color var(--duration-fast) var(--ease-out),color var(--duration-fast) var(--ease-out)",
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: sm ? 13 : 15,
    strokeWidth: 2
  }) : null, children, onRemove ? /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    },
    style: {
      display: "grid",
      placeItems: "center",
      marginRight: -3,
      cursor: "pointer",
      opacity: 0.7
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: sm ? 12 : 14,
    strokeWidth: 2.5
  })) : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const live = !disabled;
  return /*#__PURE__*/React.createElement("label", _extends({
    style: {
      display: "flex",
      alignItems: description ? "flex-start" : "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      minHeight: "var(--hit-target-min)",
      ...style
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => live && setPress(true),
    onMouseUp: () => setPress(false)
  }, rest), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "grid",
      placeItems: "center",
      width: 22,
      height: 22,
      flex: "none",
      marginTop: description ? 2 : 0,
      background: disabled ? "var(--ink-100)" : checked ? "var(--lime-500)" : "var(--paper-000)",
      color: disabled ? "var(--ink-300)" : "var(--ink-900)",
      border: "var(--border-width) solid " + (disabled ? "var(--ink-200)" : "var(--border-strong)"),
      borderRadius: "var(--radius-xs)",
      boxShadow: !live ? "none" : press ? "var(--shadow-pressed)" : hover ? "var(--shadow-sticker)" : checked ? "var(--shadow-sticker-sm)" : "none",
      transform: !live ? "none" : press ? "translate(1px,1px)" : hover ? "translate(-1px,-1px)" : "none",
      transition: "var(--transition-control)"
    }
  }, checked ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 14,
    strokeWidth: 3.25
  }) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-md)",
      fontWeight: "var(--weight-medium)",
      color: disabled ? "var(--ink-300)" : "var(--text-primary)"
    }
  }, label), description ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-xs)",
      color: disabled ? "var(--ink-300)" : "var(--text-secondary)"
    }
  }, description) : null));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  icon,
  suffix,
  prefix,
  multiline = false,
  rows = 4,
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const fieldId = id || React.useId();
  const Field = multiline ? "textarea" : "input";
  const borderColor = error ? "var(--danger-500)" : focus ? "var(--ink-900)" : "var(--ink-200)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      width: "100%",
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-primary)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: multiline ? "flex-start" : "center",
      gap: 8,
      minHeight: multiline ? undefined : "var(--control-height-md)",
      padding: multiline ? "12px 14px" : "0 14px",
      background: disabled ? "var(--ink-100)" : "var(--paper-000)",
      border: "var(--border-width) solid " + (disabled ? "var(--ink-200)" : borderColor),
      borderRadius: "var(--radius-field)",
      boxShadow: disabled ? "none" : focus ? "var(--shadow-sticker-sm)" : "var(--shadow-inset-field)",
      transition: "border-color var(--duration-fast) var(--ease-out),box-shadow var(--duration-fast) var(--ease-out)"
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18,
    color: disabled ? "var(--ink-300)" : focus ? "var(--ink-900)" : "var(--ink-400)",
    style: {
      marginTop: multiline ? 2 : 0
    }
  }) : null, prefix ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-bold)",
      fontSize: "var(--text-md)",
      color: "var(--ink-500)"
    }
  }, prefix) : null, /*#__PURE__*/React.createElement(Field, _extends({
    id: fieldId,
    rows: multiline ? rows : undefined,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      width: "100%",
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      resize: multiline ? "vertical" : undefined,
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-md)",
      lineHeight: multiline ? "var(--leading-normal)" : 1.2,
      color: disabled ? "var(--ink-300)" : "var(--text-primary)",
      padding: multiline ? 0 : "10px 0"
    }
  }, rest)), suffix ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--ink-400)"
    }
  }, suffix) : null), error || hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-xs)",
      color: error ? "var(--text-danger)" : "var(--text-secondary)"
    }
  }, error ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "alert-triangle",
    size: 13,
    strokeWidth: 2
  }) : null, error || hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  description,
  checked = false,
  onChange,
  name,
  value,
  disabled = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const live = !disabled;
  return /*#__PURE__*/React.createElement("label", _extends({
    style: {
      display: "flex",
      alignItems: description ? "flex-start" : "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      minHeight: "var(--hit-target-min)",
      ...style
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => live && setPress(true),
    onMouseUp: () => setPress(false)
  }, rest), /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "grid",
      placeItems: "center",
      width: 22,
      height: 22,
      flex: "none",
      marginTop: description ? 2 : 0,
      background: disabled ? "var(--ink-100)" : "var(--paper-000)",
      border: "var(--border-width) solid " + (disabled ? "var(--ink-200)" : "var(--border-strong)"),
      borderRadius: "var(--radius-pill)",
      boxShadow: !live ? "none" : press ? "var(--shadow-pressed)" : hover ? "var(--shadow-sticker)" : "none",
      transform: !live ? "none" : press ? "translate(1px,1px)" : hover ? "translate(-1px,-1px)" : "none",
      transition: "var(--transition-control)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: "var(--radius-pill)",
      background: disabled ? "var(--ink-300)" : checked ? "var(--ink-900)" : "transparent",
      transform: checked ? "scale(1)" : "scale(.4)",
      transition: "transform var(--duration-fast) var(--ease-snap),background-color var(--duration-fast) var(--ease-out)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-md)",
      fontWeight: "var(--weight-medium)",
      color: disabled ? "var(--ink-300)" : "var(--text-primary)"
    }
  }, label), description ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-xs)",
      color: disabled ? "var(--ink-300)" : "var(--text-secondary)"
    }
  }, description) : null));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  hint,
  options = [],
  value,
  onChange,
  placeholder = "Choose one",
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const fieldId = id || React.useId();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      width: "100%",
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      height: "var(--control-height-md)",
      padding: "0 14px",
      background: disabled ? "var(--ink-100)" : "var(--paper-000)",
      border: "var(--border-width) solid " + (disabled ? "var(--ink-200)" : focus ? "var(--ink-900)" : "var(--ink-200)"),
      borderRadius: "var(--radius-field)",
      boxShadow: disabled ? "none" : focus ? "var(--shadow-sticker-sm)" : "var(--shadow-inset-field)",
      transition: "border-color var(--duration-fast) var(--ease-out),box-shadow var(--duration-fast) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    value: value,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: "none",
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-md)",
      fontWeight: "var(--weight-medium)",
      color: disabled ? "var(--ink-300)" : value ? "var(--text-primary)" : "var(--text-muted)",
      paddingRight: 22,
      cursor: disabled ? "not-allowed" : "pointer"
    }
  }, rest), placeholder ? /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder) : null, options.map(o => {
    const opt = typeof o === "string" ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 18,
    strokeWidth: 2,
    color: disabled ? "var(--ink-300)" : "currentColor",
    style: {
      position: "absolute",
      right: 13,
      pointerEvents: "none"
    }
  })), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: label ? "space-between" : "flex-start",
      gap: 14,
      cursor: disabled ? "not-allowed" : "pointer",
      minHeight: "var(--hit-target-min)",
      width: label ? "100%" : undefined,
      ...style
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-md)",
      fontWeight: "var(--weight-medium)",
      color: disabled ? "var(--ink-300)" : "var(--text-primary)"
    }
  }, label), description ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-xs)",
      color: disabled ? "var(--ink-300)" : "var(--text-secondary)"
    }
  }, description) : null) : null, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    role: "switch",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      width: 52,
      height: 30,
      flex: "none",
      background: disabled ? "var(--ink-100)" : checked ? "var(--lime-500)" : "var(--paper-200)",
      border: "var(--border-width) solid " + (disabled ? "var(--ink-200)" : "var(--border-strong)"),
      borderRadius: "var(--radius-pill)",
      boxShadow: disabled ? "none" : hover ? "var(--shadow-sticker-sm)" : "none",
      transform: !disabled && hover ? "translate(-1px,-1px)" : "none",
      transition: "var(--transition-control)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: checked ? 24 : 2,
      width: 22,
      height: 22,
      background: disabled ? "var(--ink-300)" : "var(--ink-900)",
      borderRadius: "var(--radius-pill)",
      transition: "left var(--duration-base) var(--ease-snap)"
    }
  })));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TabBar({
  items = [],
  value,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      display: "flex",
      alignItems: "stretch",
      gap: 2,
      height: "var(--tabbar-height)",
      padding: "0 8px",
      background: "var(--paper-000)",
      borderTop: "var(--border-width) solid var(--border-strong)",
      ...style
    }
  }, rest), items.map(raw => {
    const it = typeof raw === "string" ? {
      value: raw,
      label: raw,
      icon: "home"
    } : raw;
    const on = it.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      onClick: () => onChange && onChange(it.value),
      "aria-current": on ? "page" : undefined,
      "aria-label": it.label,
      style: {
        position: "relative",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 0,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: on ? "var(--ink-900)" : "var(--ink-400)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "relative",
        display: "grid",
        placeItems: "center",
        width: 40,
        height: 40,
        background: on ? "var(--lime-500)" : "transparent",
        border: on ? "var(--border-width) solid var(--border-strong)" : "var(--border-width) solid transparent",
        borderRadius: "var(--radius-pill)",
        transition: "background-color var(--duration-base) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 18,
      strokeWidth: on ? 2.25 : 1.9
    }), it.badge ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: -3,
        right: -3,
        minWidth: 16,
        height: 16,
        padding: "0 4px",
        display: "grid",
        placeItems: "center",
        background: "var(--flare-500)",
        color: "var(--ink-900)",
        border: "var(--border-hair) solid var(--border-strong)",
        borderRadius: "var(--radius-pill)",
        fontSize: 10,
        fontWeight: "var(--weight-bold)"
      }
    }, it.badge) : null));
  }));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  items = [],
  value,
  onChange,
  variant = "segmented",
  style,
  ...rest
}) {
  const segmented = variant === "segmented";
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: segmented ? {
      display: "flex",
      gap: 4,
      padding: 4,
      background: "var(--surface-sunken)",
      border: "var(--border-width) solid var(--border-strong)",
      borderRadius: "var(--radius-pill)",
      ...style
    } : {
      display: "flex",
      gap: 20,
      borderBottom: "var(--border-width) solid var(--border-default)",
      ...style
    }
  }, rest), items.map(raw => {
    const it = typeof raw === "string" ? {
      value: raw,
      label: raw
    } : raw;
    const on = it.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(it.value),
      style: segmented ? {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 36,
        padding: "0 12px",
        cursor: "pointer",
        background: on ? "var(--paper-000)" : "transparent",
        color: on ? "var(--ink-900)" : "var(--ink-500)",
        border: on ? "var(--border-hair) solid var(--border-strong)" : "var(--border-hair) solid transparent",
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-text)",
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-bold)",
        transition: "background-color var(--duration-fast) var(--ease-out),color var(--duration-fast) var(--ease-out)"
      } : {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "0 0 10px",
        cursor: "pointer",
        background: "transparent",
        border: "none",
        borderBottom: "var(--border-thick) solid " + (on ? "var(--ink-900)" : "transparent"),
        marginBottom: "calc(var(--border-thick) * -0.6)",
        color: on ? "var(--ink-900)" : "var(--ink-400)",
        fontFamily: "var(--font-text)",
        fontSize: "var(--text-md)",
        fontWeight: on ? "var(--weight-bold)" : "var(--weight-medium)"
      }
    }, it.icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 16,
      strokeWidth: 2
    }) : null, it.label, it.count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        display: "grid",
        placeItems: "center",
        background: "var(--paper-200)",
        color: "var(--ink-900)",
        border: "var(--border-hair) solid var(--border-strong)",
        borderRadius: "var(--radius-pill)",
        fontSize: 11,
        fontWeight: "var(--weight-bold)"
      }
    }, it.count) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TopBar({
  title,
  subtitle,
  onBack,
  actions,
  wordmark = false,
  transparent = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      height: "var(--topbar-height)",
      flex: "none",
      padding: "0 var(--gutter-screen)",
      background: transparent ? "transparent" : "var(--paper-100)",
      borderBottom: transparent ? "none" : "var(--border-width) solid var(--border-strong)",
      ...style
    }
  }, rest), onBack ? /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "chevron-left",
    label: "Back",
    size: "sm",
    onClick: onBack
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, wordmark ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-2xl)",
      fontWeight: "var(--weight-black)",
      letterSpacing: "var(--tracking-display)",
      lineHeight: 1
    }
  }, "You", /*#__PURE__*/React.createElement("span", {
    style: {
      background: "var(--lime-500)",
      padding: "0 4px",
      borderRadius: 6,
      border: "var(--border-hair) solid var(--border-strong)"
    }
  }, "DO")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-lg)",
      fontWeight: "var(--weight-bold)",
      letterSpacing: "var(--tracking-heading)",
      lineHeight: 1.1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, subtitle) : null)), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, actions) : null);
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// components/quests/RewardPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function RewardPill({
  amount,
  unit = null,
  tone = "money",
  size = "md",
  icon = "coins",
  style,
  ...rest
}) {
  const lg = size === "lg";
  const tones = {
    money: {
      bg: "var(--coin-500)",
      fg: "var(--ink-900)"
    },
    ink: {
      bg: "var(--ink-900)",
      fg: "var(--paper-050)"
    },
    quiet: {
      bg: "var(--coin-100)",
      fg: "var(--ink-900)"
    }
  };
  const t = tones[tone] || tones.money;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: lg ? 8 : 6,
      height: lg ? 44 : 32,
      padding: lg ? "0 16px" : "0 11px",
      background: t.bg,
      color: t.fg,
      border: "var(--border-width) solid var(--border-strong)",
      borderRadius: "var(--radius-pill)",
      boxShadow: "var(--shadow-sticker-sm)",
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: lg ? 19 : 15,
    strokeWidth: 2
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-black)",
      fontSize: lg ? "var(--text-2xl)" : "var(--text-lg)",
      letterSpacing: "var(--tracking-heading)",
      lineHeight: 1,
      fontFeatureSettings: '"tnum" 1'
    }
  }, amount), unit ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--weight-bold)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      opacity: 0.72,
      lineHeight: 1
    }
  }, unit) : null);
}
Object.assign(__ds_scope, { RewardPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/quests/RewardPill.jsx", error: String((e && e.message) || e) }); }

// components/quests/StatusTrack.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Quest lifecycle has exactly 3 checkpoints once it's live in the feed —
   "Posted" is the default state every feed item is already in, so it isn't
   worth a checkmark of its own. current is 0-based into this fixed list
   (-1 or below = nothing reached yet, i.e. not accepted). */
var STATUS_TRACK_STEPS = [{
  label: "Accepted",
  coin: false
}, {
  label: "Doing",
  coin: false
}, {
  label: "Paid",
  coin: true
}];
function StatusTrack({
  current = -1,
  style,
  ...rest
}) {
  const lastIndex = STATUS_TRACK_STEPS.length - 1;
  const paidDone = current >= lastIndex;
  // Once paid there's nothing left "in progress" to track — collapse the
  // 3-marker row into a single "Paid ------ (check)" line, the same 26px
  // row height as the in-progress state instead of stacking a caption
  // underneath it.
  if (paidDone) {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: "none",
        marginRight: 8,
        fontFamily: "var(--font-text)",
        fontSize: "var(--text-3xs)",
        fontWeight: "var(--weight-bold)",
        color: "var(--ink-900)"
      }
    }, "Paid"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: "var(--border-width)",
        background: "var(--ink-900)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "grid",
        placeItems: "center",
        width: 26,
        height: 26,
        flex: "none",
        marginLeft: 8,
        background: "var(--coin-500)",
        border: "var(--border-width) solid var(--border-strong)",
        borderRadius: "var(--radius-pill)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 13,
      strokeWidth: 3,
      color: "var(--ink-900)"
    })));
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      ...style
    }
  }, rest), STATUS_TRACK_STEPS.map((s, i) => {
    const done = i <= current;
    const isLast = i === lastIndex;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s.label
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "grid",
        placeItems: "center",
        width: 26,
        height: 26,
        flex: "none",
        background: done ? "var(--ink-900)" : "var(--paper-000)",
        border: "var(--border-width) solid var(--border-strong)",
        borderRadius: "var(--radius-pill)"
      }
    }, done ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 13,
      strokeWidth: 3,
      color: "var(--paper-050)"
    }) : null), isLast ? null : /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: "var(--border-width)",
        background: i + 1 <= current ? "var(--ink-900)" : "var(--ink-200)",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%,-50%)",
        background: "var(--surface-card)",
        padding: "0 6px",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-text)",
        fontSize: "var(--text-3xs)",
        fontWeight: done ? "var(--weight-bold)" : "var(--weight-medium)",
        color: done ? "var(--ink-900)" : "var(--ink-400)"
      }
    }, s.label)));
  }));
}
Object.assign(__ds_scope, { StatusTrack });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/quests/StatusTrack.jsx", error: String((e && e.message) || e) }); }

// components/quests/UserChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function UserChip({
  name,
  src,
  rating,
  quests,
  verified = false,
  meta,
  size = "md",
  style,
  ...rest
}) {
  const av = size === "lg" ? "lg" : size === "sm" ? "sm" : "md";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    src: src,
    size: av,
    verified: verified
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-text)",
      fontSize: size === "lg" ? "var(--text-lg)" : "var(--text-sm)",
      fontWeight: "var(--weight-bold)",
      lineHeight: 1.2,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-2xs)",
      color: "var(--text-secondary)",
      lineHeight: 1.2
    }
  }, quests != null ? /*#__PURE__*/React.createElement("span", null, quests, " quests") : null, rating != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      fontWeight: "var(--weight-semibold)",
      color: "var(--ink-800)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "star",
    size: 12,
    filled: true,
    color: "var(--coin-500)"
  }), rating) : null, meta ? /*#__PURE__*/React.createElement("span", null, meta) : null)));
}
Object.assign(__ds_scope, { UserChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/quests/UserChip.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VARIANTS = {
  sticker: {
    bg: "var(--surface-card)",
    fg: "var(--text-primary)",
    border: "var(--border-strong)",
    borderWidth: "var(--border-width)",
    shadow: "var(--shadow-sticker)"
  },
  flat: {
    bg: "var(--surface-card)",
    fg: "var(--text-primary)",
    border: "var(--border-default)",
    borderWidth: "var(--border-hair)",
    shadow: "none"
  },
  sunken: {
    bg: "var(--surface-sunken)",
    fg: "var(--text-primary)",
    border: "transparent",
    borderWidth: "var(--border-width)",
    shadow: "none"
  },
  accent: {
    bg: "var(--surface-accent)",
    fg: "var(--ink-900)",
    border: "var(--border-strong)",
    borderWidth: "var(--border-width)",
    shadow: "var(--shadow-sticker)"
  },
  money: {
    bg: "var(--surface-money)",
    fg: "var(--ink-900)",
    border: "var(--border-strong)",
    borderWidth: "var(--border-width)",
    shadow: "var(--shadow-sticker)"
  },
  inverse: {
    bg: "var(--surface-inverse)",
    fg: "var(--text-inverse)",
    border: "var(--border-strong)",
    borderWidth: "var(--border-width)",
    shadow: "var(--shadow-sticker-lime)"
  }
};
function Card({
  children,
  variant = "sticker",
  padding = "md",
  media,
  onClick,
  interactive,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.sticker;
  const live = Boolean(onClick) || interactive;
  const pad = padding === "none" ? 0 : padding === "sm" ? 12 : padding === "lg" ? 20 : 16;
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => live && setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      background: v.bg,
      color: v.fg,
      border: v.borderWidth + " solid " + v.border,
      borderRadius: "var(--radius-card)",
      boxShadow: !live || v.shadow === "none" ? v.shadow : press ? "var(--shadow-pressed)" : hover ? "var(--shadow-sticker-lg)" : v.shadow,
      transform: !live ? "none" : press ? "translate(2px,2px)" : hover ? "translate(-1px,-1px)" : "none",
      transition: "var(--transition-control)",
      cursor: live ? "pointer" : "default",
      overflow: "hidden",
      ...style
    }
  }, rest), media ? /*#__PURE__*/React.createElement("div", {
    style: {
      margin: 0,
      borderBottom: "var(--border-width) solid " + v.border,
      overflow: "hidden"
    }
  }, media) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pad,
      display: "flex",
      flexDirection: "column",
      gap: "var(--card-gap)",
      flex: 1,
      minWidth: 0
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/quests/QuestCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Meta({
  icon,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--weight-medium)",
      color: "var(--text-secondary)",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 13,
    strokeWidth: 2
  }), children);
}
function QuestCard({
  title,
  payout,
  category,
  distance,
  duration,
  when,
  poster,
  badges = [],
  saved = false,
  onSave,
  action,
  variant = "feed",
  onClick,
  style,
  ...rest
}) {
  const compact = variant === "compact";
  // Alternate layouts: a selectable option alongside the default feed/compact
  // card, kept fully separate so the original never changes. Both share the
  // same 4-row shape — row 1: status badge (left) + save/heart (right);
  // row 2: title on its own full-width line (no 2-3 line wrap); row 3:
  // metadata, same as current; row 4: left slot + price (right) — but differ
  // in what row 4's left slot shows: "spacious" shows the poster (as
  // requested first), "spacious-meta" shows metadata (category) instead of
  // the poster. Spacing is pulled tight (single gap:4 column, small heart
  // button, thin bottom-row padding) so the total height matches the default
  // card instead of running taller.
  const spacious = variant === "spacious" || variant === "spacious-meta";
  const spaciousMeta = variant === "spacious-meta";
  const saveButton = onSave ? /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onSave(e);
    },
    "aria-label": "Save quest",
    style: {
      display: "grid",
      placeItems: "center",
      width: 28,
      height: 28,
      padding: 0,
      cursor: "pointer",
      background: "transparent",
      border: "none",
      color: saved ? "var(--flare-500)" : "var(--ink-300)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "heart",
    size: 19,
    filled: saved,
    strokeWidth: 2
  })) : null;
  if (spacious) {
    const compactSaveButton = onSave ? /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        onSave(e);
      },
      "aria-label": "Save quest",
      style: {
        display: "grid",
        placeItems: "center",
        width: 24,
        height: 24,
        padding: 0,
        cursor: "pointer",
        background: "transparent",
        border: "none",
        color: saved ? "var(--flare-500)" : "var(--ink-300)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "heart",
      size: 16,
      filled: saved,
      strokeWidth: 2
    })) : null;
    const bottomLeft = spaciousMeta ? category ? /*#__PURE__*/React.createElement(__ds_scope.Tag, {
      size: "sm"
    }, category) : when ? /*#__PURE__*/React.createElement(Meta, {
      icon: "calendar"
    }, when) : /*#__PURE__*/React.createElement("span", null) : poster ? /*#__PURE__*/React.createElement(__ds_scope.UserChip, {
      name: poster.name,
      src: poster.src,
      rating: poster.rating,
      quests: poster.quests,
      verified: poster.verified,
      size: "sm"
    }) : category ? /*#__PURE__*/React.createElement(__ds_scope.Tag, {
      size: "sm"
    }, category) : /*#__PURE__*/React.createElement("span", null);
    return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
      onClick: onClick,
      padding: "sm",
      style: {
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8
      }
    }, badges.length ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
      tone: badges[0].tone,
      icon: badges[0].icon,
      size: "sm"
    }, badges[0].label) : /*#__PURE__*/React.createElement("span", null), compactSaveButton), /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: 0,
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-lg)",
        fontWeight: "var(--weight-bold)",
        letterSpacing: "var(--tracking-heading)",
        lineHeight: "var(--leading-snug)",
        textWrap: "pretty"
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap"
      }
    }, distance ? /*#__PURE__*/React.createElement(Meta, {
      icon: "map-pin"
    }, distance) : null, duration ? /*#__PURE__*/React.createElement(Meta, {
      icon: "clock"
    }, duration) : null, when ? /*#__PURE__*/React.createElement(Meta, {
      icon: "calendar"
    }, when) : null)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        paddingTop: 8,
        borderTop: "var(--border-hair) solid var(--border-subtle)"
      }
    }, bottomLeft, /*#__PURE__*/React.createElement(__ds_scope.RewardPill, {
      amount: payout,
      size: "md"
    })));
  }
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    onClick: onClick,
    padding: compact ? "sm" : "md",
    style: {
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, badges.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, badges.map(b => /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    key: b.label,
    tone: b.tone,
    icon: b.icon,
    size: "sm"
  }, b.label))) : null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: compact ? "var(--text-md)" : "var(--text-lg)",
      fontWeight: "var(--weight-bold)",
      letterSpacing: "var(--tracking-heading)",
      lineHeight: "var(--leading-snug)",
      textWrap: "pretty"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, distance ? /*#__PURE__*/React.createElement(Meta, {
    icon: "map-pin"
  }, distance) : null, duration ? /*#__PURE__*/React.createElement(Meta, {
    icon: "clock"
  }, duration) : null, when ? /*#__PURE__*/React.createElement(Meta, {
    icon: "calendar"
  }, when) : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.RewardPill, {
    amount: payout,
    size: "md"
  }), saveButton)), category || poster || action ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      paddingTop: 12,
      borderTop: "var(--border-hair) solid var(--border-subtle)"
    }
  }, poster ? /*#__PURE__*/React.createElement(__ds_scope.UserChip, {
    name: poster.name,
    src: poster.src,
    rating: poster.rating,
    quests: poster.quests,
    verified: poster.verified,
    size: "sm"
  }) : category ? /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    size: "sm"
  }, category) : /*#__PURE__*/React.createElement("span", null), action || (category && poster ? /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    size: "sm"
  }, category) : null)) : null);
}
Object.assign(__ds_scope, { QuestCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/quests/QuestCard.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Dialog({
  open = false,
  onClose,
  title,
  subtitle,
  children,
  actions,
  variant = "sheet",
  style,
  ...rest
}) {
  if (!open) return null;
  const sheet = variant === "sheet";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 60,
      display: "flex",
      alignItems: sheet ? "flex-end" : "center",
      justifyContent: "center",
      background: "var(--surface-overlay)",
      backdropFilter: "blur(2px)"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", _extends({
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: sheet ? undefined : 360,
      maxHeight: "88%",
      overflowY: "auto",
      background: "var(--surface-card)",
      border: "var(--border-width) solid var(--border-strong)",
      borderRadius: sheet ? "var(--radius-sheet) var(--radius-sheet) 0 0" : "var(--radius-xl)",
      boxShadow: "var(--shadow-overlay)",
      padding: "18px 20px 20px",
      animation: sheet ? "youdo-sheet-in var(--duration-sheet) var(--ease-snap)" : "youdo-pop-in var(--duration-base) var(--ease-snap)",
      ...style
    }
  }, rest), sheet ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 4,
      background: "var(--ink-200)",
      borderRadius: "var(--radius-pill)",
      margin: "-6px auto 14px"
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title ? /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-xl)",
      fontWeight: "var(--weight-bold)",
      letterSpacing: "var(--tracking-heading)"
    }
  }, title) : null, subtitle ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)"
    }
  }, subtitle) : null), onClose ? /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "Close",
    variant: "ghost",
    size: "sm",
    onClick: onClose
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, children), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 18
    }
  }, actions) : null), /*#__PURE__*/React.createElement("style", null, "@keyframes youdo-sheet-in{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes youdo-pop-in{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}}"));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: "var(--ink-900)",
    fg: "var(--paper-050)",
    icon: "info"
  },
  success: {
    bg: "var(--ink-900)",
    fg: "var(--paper-050)",
    icon: "check-circle"
  },
  money: {
    bg: "var(--coin-500)",
    fg: "var(--ink-900)",
    icon: "coins"
  },
  danger: {
    bg: "var(--ink-900)",
    fg: "var(--paper-050)",
    icon: "alert-triangle"
  }
};
function Toast({
  children,
  tone = "neutral",
  icon,
  action,
  onAction,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      width: "100%",
      padding: "12px 14px",
      background: t.bg,
      color: t.fg,
      border: "var(--border-width) solid var(--border-strong)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-sticker)",
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      animation: "youdo-toast-in var(--duration-slow) var(--ease-snap)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon || t.icon,
    size: 18,
    strokeWidth: 2
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, children), action ? /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      background: "transparent",
      border: "none",
      padding: 0,
      cursor: "pointer",
      color: "inherit",
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-bold)",
      textDecoration: "underline",
      textUnderlineOffset: 2
    }
  }, action) : null, /*#__PURE__*/React.createElement("style", null, "@keyframes youdo-toast-in{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Toast.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tooltip({
  children,
  label,
  placement = "top",
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const pos = placement === "bottom" ? {
    top: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)"
  } : {
    bottom: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)"
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false)
  }, rest), children, open ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      zIndex: 40,
      whiteSpace: "nowrap",
      pointerEvents: "none",
      padding: "6px 9px",
      background: "var(--ink-900)",
      color: "var(--paper-050)",
      border: "var(--border-hair) solid var(--border-strong)",
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-text)",
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--weight-semibold)",
      boxShadow: "var(--shadow-soft)",
      ...pos
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Tooltip.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/BrowseScreen.jsx
try { (() => {
const {
  TopBar,
  Input,
  Tag,
  QuestCard,
  Card,
  IconButton,
  Icon,
  Badge,
  Button,
  Dialog,
  Select,
  Checkbox
} = window.YouDODesignSystem_ea424c;
function BrowseScreen({
  onOpenQuest,
  saved,
  onToggleSave
}) {
  const D = window.YOUDO_DATA;
  const [cat, setCat] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [filters, setFilters] = React.useState(false);
  const list = D.quests.filter(function (x) {
    const okCat = cat === "All" || x.category === cat;
    const okQ = !q || x.title.toLowerCase().indexOf(q.toLowerCase()) > -1;
    return okCat && okQ;
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    wordmark: true,
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconButton, {
      icon: "bell",
      label: "Notifications",
      size: "sm",
      badge: 3
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "user",
      label: "Profile",
      size: "sm"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px var(--gutter-screen) 0",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    icon: "search",
    placeholder: "Search quests near you",
    value: q,
    onChange: function (e) {
      setQ(e.target.value);
    }
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "sliders-horizontal",
    label: "Filters",
    active: filters,
    onClick: function () {
      setFilters(true);
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      overflowX: "auto",
      margin: "0 calc(-1 * var(--gutter-screen))",
      padding: "2px var(--gutter-screen) 4px"
    }
  }, D.categories.map(function (c) {
    return /*#__PURE__*/React.createElement(Tag, {
      key: c,
      size: "sm",
      selected: cat === c,
      onSelect: function () {
        setCat(c);
      }
    }, c);
  })), /*#__PURE__*/React.createElement(Card, {
    variant: "accent",
    padding: "md",
    style: {
      marginTop: 2
    }
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
  }, "\xA342 waiting nearby"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      marginTop: 4
    }
  }, "5 quests within 3 km of you right now")), /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    size: 28,
    strokeWidth: 2
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-bold) var(--text-2xs)/1 var(--font-text)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--ink-400)"
    }
  }, "Near you"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)"
    }
  }, "Closest first ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 14,
    strokeWidth: 2.25
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px var(--gutter-screen) 24px",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, list.map(function (x) {
    return /*#__PURE__*/React.createElement(QuestCard, {
      key: x.id,
      title: x.title,
      payout: x.payout,
      payoutUnit: x.payoutUnit,
      category: x.category,
      distance: x.distance,
      duration: x.duration,
      when: x.when,
      badges: x.badges,
      poster: x.poster,
      saved: saved.indexOf(x.id) > -1,
      onSave: function () {
        onToggleSave(x.id);
      },
      onClick: function () {
        onOpenQuest(x.id);
      }
    });
  }), list.length === 0 ? /*#__PURE__*/React.createElement(Card, {
    variant: "flat",
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--weight-bold) var(--text-md)/1.2 var(--font-display)"
    }
  }, "Nothing matches that yet"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)"
    }
  }, "Try a wider radius, or clear the category filter."), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    onClick: function () {
      setCat("All");
      setQ("");
    }
  }, "Clear filters")) : null)), /*#__PURE__*/React.createElement(Dialog, {
    open: filters,
    onClose: function () {
      setFilters(false);
    },
    title: "Filters",
    subtitle: "Showing quests within 3 km",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: function () {
        setFilters(false);
      }
    }, "Reset"), /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: function () {
        setFilters(false);
      }
    }, "Show quests"))
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Distance",
    options: ["Within 1 km", "Within 3 km", "Within 5 km", "Anywhere in town"],
    defaultValue: "Within 3 km"
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Pays at least",
    options: ["£5", "£10", "£20", "£40"],
    defaultValue: "\xA310"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Today only",
    description: "Hide quests scheduled for later"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Verified posters only",
    checked: true
  })));
}
Object.assign(window, {
  BrowseScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/BrowseScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ChatsScreen.jsx
try { (() => {
const {
  TopBar,
  Tabs,
  Card,
  Badge,
  Button,
  IconButton,
  Icon,
  Input,
  UserChip,
  Avatar,
  QuestCard,
  StatusTrack,
  RewardPill
} = window.YouDODesignSystem_ea424c;
function ChatsScreen() {
  const D = window.YOUDO_DATA;
  const [tab, setTab] = React.useState("chats");
  const [open, setOpen] = React.useState(null);
  const [msgs, setMsgs] = React.useState(D.thread);
  const [draft, setDraft] = React.useState("");
  const chat = D.chats.filter(function (c) {
    return c.id === open;
  })[0];
  function send() {
    if (!draft) return;
    setMsgs(msgs.concat([{
      from: "me",
      text: draft,
      time: "now"
    }]));
    setDraft("");
  }
  if (chat) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement(TopBar, {
      title: chat.name,
      subtitle: chat.quest,
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
        borderTop: "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(StatusTrack, {
      current: 1,
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(RewardPill, {
      amount: "\xA318",
      unit: null,
      tone: "quiet"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "16px var(--gutter-screen)",
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, msgs.map(function (m, i) {
      const mine = m.from === "me";
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: "flex",
          justifyContent: mine ? "flex-end" : "flex-start",
          gap: 8
        }
      }, mine ? null : /*#__PURE__*/React.createElement(Avatar, {
        name: chat.name,
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
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Message",
      value: draft,
      onChange: function (e) {
        setDraft(e.target.value);
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
      padding: "14px var(--gutter-screen) 0"
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    items: [{
      value: "chats",
      label: "Chats",
      count: 3
    }, {
      value: "offers",
      label: "My offers",
      count: 2
    }],
    value: tab,
    onChange: setTab
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "12px var(--gutter-screen) 24px",
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, tab === "chats" ? D.chats.map(function (c) {
    return /*#__PURE__*/React.createElement(Card, {
      key: c.id,
      padding: "sm",
      onClick: function () {
        setOpen(c.id);
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(UserChip, {
      name: c.name,
      rating: c.rating,
      quests: c.quests,
      verified: c.verified,
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
    }, c.time), c.unread ? /*#__PURE__*/React.createElement(Badge, {
      tone: "hot",
      size: "sm"
    }, c.unread, " new") : null)), /*#__PURE__*/React.createElement("div", {
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
    }, c.quest), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: c.unread ? "var(--weight-semibold)" : "var(--weight-regular)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, c.last)));
  }) : D.mine.map(function (m) {
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
      amount: m.payout,
      unit: null
    })), /*#__PURE__*/React.createElement(StatusTrack, {
      current: m.step
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        paddingTop: 10,
        borderTop: "var(--border-hair) solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement(UserChip, {
      name: m.counterpart.name,
      rating: m.counterpart.rating,
      quests: m.counterpart.quests,
      verified: m.counterpart.verified,
      size: "sm",
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: m.step >= 2 ? "primary" : "secondary"
    }, m.step >= 2 ? "Mark as done" : "Message")));
  })));
}
Object.assign(window, {
  ChatsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ChatsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/PostQuestScreen.jsx
try { (() => {
const {
  TopBar,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Switch,
  RewardPill,
  Icon,
  StatusTrack
} = window.YouDODesignSystem_ea424c;
function PostQuestScreen({
  onPosted
}) {
  const D = window.YOUDO_DATA;
  const [title, setTitle] = React.useState("");
  const [cat, setCat] = React.useState("Delivery");
  const [budget, setBudget] = React.useState("");
  const [urgent, setUrgent] = React.useState(false);
  const bad = title.length > 0 && title.length < 8;
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
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "16px var(--gutter-screen) 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "What needs doing?",
    placeholder: "Walk my dog for an hour",
    value: title,
    onChange: function (e) {
      setTitle(e.target.value);
    },
    hint: bad ? undefined : "Be specific — clear quests get taken 3× faster",
    error: bad ? "Give it a few more words so doers know what's involved" : undefined
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Details",
    multiline: true,
    rows: 3,
    placeholder: "Anything a stranger would need to know: access, tools, timing."
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Category",
    options: D.categories.slice(1),
    value: cat,
    onChange: function (e) {
      setCat(e.target.value);
    }
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-bold) var(--text-2xs)/1 var(--font-text)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--ink-400)"
    }
  }, "Where & when"), /*#__PURE__*/React.createElement(Input, {
    label: "Address",
    icon: "map-pin",
    placeholder: "Oranienstra\xDFe 14, Kreuzberg"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Day",
    icon: "calendar",
    placeholder: "Today"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Time",
    icon: "clock",
    placeholder: "6pm"
  })), /*#__PURE__*/React.createElement(Switch, {
    label: "Needs doing urgently",
    description: "Shows an \u2018ends soon\u2019 badge to nearby doers",
    checked: urgent,
    onChange: function () {
      setUrgent(!urgent);
    }
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-bold) var(--text-2xs)/1 var(--font-text)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--ink-400)"
    }
  }, "What's it worth"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, ["£10", "£15", "£20", "£25"].map(function (p) {
    return /*#__PURE__*/React.createElement(Tag, {
      key: p,
      selected: budget === p,
      onSelect: function () {
        setBudget(p);
      }
    }, p);
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Or set your own",
    prefix: "\xA3",
    suffix: "fixed",
    value: budget.replace("£", ""),
    onChange: function (e) {
      setBudget("£" + e.target.value);
    }
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
  }, "We hold the money until you mark the quest done. Nothing leaves your wallet before that."))), /*#__PURE__*/React.createElement(Card, {
    variant: "sunken",
    padding: "md"
  }, /*#__PURE__*/React.createElement(StatusTrack, {
    current: 0
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px var(--gutter-screen)",
      background: "var(--paper-000)",
      borderTop: "var(--border-width) solid var(--border-strong)",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(RewardPill, {
    amount: budget || "£0",
    unit: "fixed"
  }), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    fullWidth: true,
    icon: "plus",
    onClick: onPosted
  }, "Post quest")));
}
Object.assign(window, {
  PostQuestScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/PostQuestScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/QuestDetailScreen.jsx
try { (() => {
const {
  TopBar,
  Card,
  Badge,
  Tag,
  Button,
  IconButton,
  Icon,
  UserChip,
  RewardPill,
  Dialog,
  Input,
  Radio,
  Toast
} = window.YouDODesignSystem_ea424c;
function Row({
  icon,
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 0",
      borderBottom: "var(--border-hair) solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 17,
    color: "var(--ink-500)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-bold)"
    }
  }, value));
}
function QuestDetailScreen({
  quest,
  onBack,
  onOffered,
  saved,
  onToggleSave
}) {
  const [sheet, setSheet] = React.useState(false);
  const [price, setPrice] = React.useState(quest.payout.replace("£", ""));
  const [mode, setMode] = React.useState("asking");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: quest.title,
    subtitle: quest.distance + " · " + quest.when,
    onBack: onBack,
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: "heart",
      label: "Save",
      size: "sm",
      onClick: function () {
        onToggleSave(quest.id);
      },
      style: {
        color: saved ? "var(--flare-500)" : undefined
      }
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "16px var(--gutter-screen) 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, quest.badges.map(function (b) {
    return /*#__PURE__*/React.createElement(Badge, {
      key: b.label,
      tone: b.tone,
      icon: b.icon,
      size: "sm"
    }, b.label);
  }), /*#__PURE__*/React.createElement(Tag, {
    size: "sm"
  }, quest.category)), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "2px 0 0",
      font: "var(--weight-black) var(--text-2xl)/var(--leading-snug) var(--font-display)",
      letterSpacing: "var(--tracking-heading)"
    }
  }, quest.title), /*#__PURE__*/React.createElement(RewardPill, {
    amount: quest.payout,
    unit: quest.payoutUnit,
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
    value: quest.distance
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "clock",
    label: "How long",
    value: quest.duration
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
    style: {
      font: "var(--weight-bold) var(--text-2xs)/1 var(--font-text)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--ink-500)"
    }
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
    name: quest.poster.name,
    rating: quest.poster.rating,
    quests: quest.poster.quests,
    verified: quest.poster.verified,
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
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "success",
    icon: "shield-check",
    size: "sm"
  }, "ID verified"), /*#__PURE__*/React.createElement(Badge, {
    size: "sm"
  }, quest.offers, " offers so far"))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      color: "var(--text-muted)",
      textAlign: "center"
    }
  }, "Exact address is shared once your offer is accepted")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px var(--gutter-screen)",
      background: "var(--paper-000)",
      borderTop: "var(--border-width) solid var(--border-strong)",
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Button, {
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
    subtitle: quest.poster.name + " usually replies in 10 min",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: function () {
        setSheet(false);
      }
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: function () {
        setSheet(false);
        onOffered();
      }
    }, "Send offer"))
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "mode",
    label: "Take it at " + quest.payout,
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
    prefix: "\xA3",
    value: price,
    onChange: function (e) {
      setPrice(e.target.value);
    }
  }) : null, /*#__PURE__*/React.createElement(Input, {
    label: "Add a note",
    multiline: true,
    rows: 2,
    placeholder: "I walk two dogs on this street already \u2014 happy to send a photo mid-walk."
  })));
}
Object.assign(window, {
  QuestDetailScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/QuestDetailScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/WalletScreen.jsx
try { (() => {
const {
  TopBar,
  Card,
  Button,
  Badge,
  Icon,
  IconButton,
  RewardPill,
  Avatar,
  Switch,
  Dialog,
  Input,
  Tabs
} = window.YouDODesignSystem_ea424c;
function WalletScreen({
  onCashOut
}) {
  const D = window.YOUDO_DATA;
  const [sheet, setSheet] = React.useState(false);
  const [tab, setTab] = React.useState("activity");
  const [alerts, setAlerts] = React.useState(true);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "Wallet",
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: "sliders-horizontal",
      label: "Settings",
      size: "sm"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "16px var(--gutter-screen) 24px",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "money",
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-bold) var(--text-2xs)/1 var(--font-text)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      opacity: 0.7
    }
  }, "Available"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--weight-black) var(--text-5xl)/1 var(--font-display)",
      letterSpacing: "-0.035em",
      fontFeatureSettings: '"tnum" 1'
    }
  }, D.me.balance), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "ink",
    icon: "clock",
    size: "sm"
  }, D.me.pending, " held"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)"
    }
  }, "released when quests are marked done")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    icon: "wallet",
    fullWidth: true,
    onClick: function () {
      setSheet(true);
    }
  }, "Cash out"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "credit-card",
    style: {
      padding: "0 16px"
    }
  }, "Card"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      color: "var(--text-secondary)",
      fontWeight: "var(--weight-semibold)"
    }
  }, "This month"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--weight-black) var(--text-2xl)/1 var(--font-display)",
      fontFeatureSettings: '"tnum" 1'
    }
  }, "\xA3186"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      color: "var(--success-600)",
      fontWeight: "var(--weight-semibold)"
    }
  }, "9 quests done")), /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      color: "var(--text-secondary)",
      fontWeight: "var(--weight-semibold)"
    }
  }, "Your rating"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 20,
    filled: true,
    color: "var(--coin-500)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-black) var(--text-2xl)/1 var(--font-display)"
    }
  }, D.me.rating)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      color: "var(--text-secondary)",
      fontWeight: "var(--weight-semibold)"
    }
  }, D.me.quests, " quests total"))), /*#__PURE__*/React.createElement(Tabs, {
    items: [{
      value: "activity",
      label: "Activity"
    }, {
      value: "settings",
      label: "Settings"
    }],
    value: tab,
    onChange: setTab
  }), tab === "activity" ? /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, D.payouts.map(function (p, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderTop: i === 0 ? "none" : "var(--border-hair) solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "grid",
        placeItems: "center",
        width: 36,
        height: 36,
        flex: "none",
        background: p.amount.indexOf("−") === 0 ? "var(--paper-200)" : "var(--coin-200)",
        border: "var(--border-hair) solid var(--border-strong)",
        borderRadius: "var(--radius-pill)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: p.amount.indexOf("−") === 0 ? "credit-card" : "coins",
      size: 17
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
    }, p.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-2xs)",
        color: "var(--text-secondary)"
      }
    }, p.who)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--weight-bold) var(--text-md)/1 var(--font-display)",
        fontFeatureSettings: '"tnum" 1'
      }
    }, p.amount), /*#__PURE__*/React.createElement(Badge, {
      tone: p.tone,
      size: "sm"
    }, p.state)));
  })) : /*#__PURE__*/React.createElement(Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      paddingBottom: 12,
      borderBottom: "var(--border-hair) solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: D.me.name,
    size: "lg",
    verified: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--weight-bold) var(--text-lg)/1.2 var(--font-display)"
    }
  }, D.me.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)"
    }
  }, "ID verified \xB7 Kreuzberg")), /*#__PURE__*/React.createElement(IconButton, {
    icon: "pencil",
    label: "Edit profile",
    size: "sm"
  })), /*#__PURE__*/React.createElement(Switch, {
    label: "Quests near me",
    description: "Ping me when something lands within 2 km",
    checked: alerts,
    onChange: function () {
      setAlerts(!alerts);
    }
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Weekly earnings summary",
    checked: false
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Auto cash-out every Friday",
    description: "Straight to \u2022\u2022\u2022\u2022 4417",
    checked: alerts,
    onChange: function () {
      setAlerts(!alerts);
    }
  }))), /*#__PURE__*/React.createElement(Dialog, {
    open: sheet,
    onClose: function () {
      setSheet(false);
    },
    title: "Cash out",
    subtitle: "Arrives in your bank within a day",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: function () {
        setSheet(false);
      }
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "money",
      fullWidth: true,
      onClick: function () {
        setSheet(false);
        onCashOut();
      }
    }, "Send \xA360"))
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Amount",
    prefix: "\xA3",
    defaultValue: "60",
    hint: "\xA3312.40 available"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 14px",
      background: "var(--paper-100)",
      border: "var(--border-hair) solid var(--border-default)",
      borderRadius: "var(--radius-card-inner)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "credit-card",
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      flex: 1,
      fontWeight: "var(--weight-semibold)"
    }
  }, "Sparkasse \u2022\u2022\u2022\u2022 4417"), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16
  }))));
}
Object.assign(window, {
  WalletScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/WalletScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
window.YOUDO_DATA = {
  me: {
    name: "Sam W.",
    rating: 4.8,
    quests: 27,
    balance: "£312.40",
    pending: "£42"
  },
  categories: ["All", "Delivery", "Dog walking", "Assembly", "Moving", "Tech help", "Cleaning"],
  quests: [{
    id: "q1",
    title: "Walk Biscuit for an hour",
    payout: "£18",
    payoutUnit: "fixed",
    category: "Dog walking",
    distance: "1.2 km",
    duration: "~60 min",
    when: "Today, 6pm",
    badges: [{
      label: "Ends in 2h",
      tone: "hot",
      icon: "clock"
    }],
    poster: {
      name: "Mila R.",
      rating: 4.9,
      quests: 38,
      verified: true
    },
    address: "Oranienstraße 14, Kreuzberg",
    details: "Biscuit is a very slow beagle who stops at every tree. Lead and bags are by the door — ring the buzzer and I'll hand him over. An hour around the park is plenty.",
    requirements: ["Comfortable with medium dogs", "Send one photo mid-walk"],
    offers: 3
  }, {
    id: "q2",
    title: "Pick up a parcel from the post office",
    payout: "£9",
    payoutUnit: "fixed",
    category: "Delivery",
    distance: "600 m",
    duration: "~20 min",
    when: "Tomorrow, 10am",
    badges: [],
    poster: {
      name: "Tomás B.",
      rating: 4.7,
      quests: 12
    },
    address: "Postfiliale, Skalitzer Str.",
    details: "One shoebox-sized parcel, already paid. I'll send the collection code in chat.",
    requirements: ["Bring a bag"],
    offers: 1
  }, {
    id: "q3",
    title: "Assemble a wardrobe (2 boxes)",
    payout: "£14",
    payoutUnit: "per hr",
    category: "Assembly",
    distance: "2.4 km",
    duration: "~3 hr",
    when: "Sat, 11am",
    badges: [{
      label: "Tools needed",
      tone: "warning",
      icon: "briefcase"
    }],
    poster: {
      name: "Jo K.",
      rating: 5.0,
      quests: 3,
      verified: true
    },
    address: "Weichselstraße 9, Neukölln",
    details: "Flat-pack wardrobe, two boxes, instructions included. I'll be home the whole time and there's coffee.",
    requirements: ["Own drill", "Two hands free on Saturday"],
    offers: 6
  }, {
    id: "q4",
    title: "Help carry a sofa down two floors",
    payout: "£25",
    payoutUnit: "fixed",
    category: "Moving",
    distance: "3.1 km",
    duration: "~45 min",
    when: "Today, 8pm",
    badges: [{
      label: "New",
      tone: "accent"
    }],
    poster: {
      name: "Deniz A.",
      rating: 4.6,
      quests: 21
    },
    address: "Reuterstraße 30, Neukölln",
    details: "Two-seater sofa, second floor, no lift. Van is already booked — I just need a second pair of arms.",
    requirements: ["Can lift 30 kg"],
    offers: 2
  }, {
    id: "q5",
    title: "Set up a printer and show me how it works",
    payout: "£16",
    payoutUnit: "fixed",
    category: "Tech help",
    distance: "900 m",
    duration: "~40 min",
    when: "Thu, 5pm",
    badges: [],
    poster: {
      name: "Renate H.",
      rating: 4.9,
      quests: 8,
      verified: true
    },
    address: "Wienerstraße 2, Kreuzberg",
    details: "New printer still in the box. Patience appreciated — I'd like to be able to do it myself afterwards.",
    requirements: ["Patient explainer"],
    offers: 4
  }],
  mine: [{
    id: "m1",
    title: "Walk Biscuit for an hour",
    payout: "£18",
    category: "Dog walking",
    step: 2,
    role: "doing",
    when: "Today, 6pm",
    counterpart: {
      name: "Mila R.",
      rating: 4.9,
      quests: 38,
      verified: true
    }
  }, {
    id: "m2",
    title: "Drop two bags at the charity shop",
    payout: "£11",
    category: "Delivery",
    step: 3,
    role: "posted",
    when: "Mon, 2pm",
    counterpart: {
      name: "Ola P.",
      rating: 4.8,
      quests: 44
    }
  }],
  chats: [{
    id: "c1",
    name: "Mila R.",
    quest: "Walk Biscuit for an hour",
    last: "Buzzer is 14B, see you at six",
    time: "12:41",
    unread: 2,
    verified: true,
    rating: 4.9,
    quests: 38
  }, {
    id: "c2",
    name: "Jo K.",
    quest: "Assemble a wardrobe (2 boxes)",
    last: "Do you have a drill or shall I borrow one?",
    time: "11:08",
    unread: 0,
    verified: true,
    rating: 5.0,
    quests: 3
  }, {
    id: "c3",
    name: "Tomás B.",
    quest: "Pick up a parcel",
    last: "Code is 4471 — thanks!",
    time: "Yesterday",
    unread: 0,
    rating: 4.7,
    quests: 12
  }],
  thread: [{
    from: "them",
    text: "Hi! Are you free at six today?",
    time: "12:20"
  }, {
    from: "me",
    text: "Yes — I can be there a few minutes early.",
    time: "12:33"
  }, {
    from: "them",
    text: "Perfect. Biscuit is slow, so an hour is plenty.",
    time: "12:38"
  }, {
    from: "them",
    text: "Buzzer is 14B, see you at six",
    time: "12:41"
  }],
  payouts: [{
    id: "p1",
    label: "Walk Biscuit for an hour",
    who: "Mila R.",
    amount: "+£18",
    state: "Held until done",
    tone: "warning"
  }, {
    id: "p2",
    label: "Set up a printer",
    who: "Renate H.",
    amount: "+£16",
    state: "Paid",
    tone: "success"
  }, {
    id: "p3",
    label: "Carry a sofa down two floors",
    who: "Deniz A.",
    amount: "+£25",
    state: "Paid",
    tone: "success"
  }, {
    id: "p4",
    label: "Cash out to bank",
    who: "•••• 4417",
    amount: "−£60",
    state: "Sent",
    tone: "neutral"
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.TabBar = __ds_scope.TabBar;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.TopBar = __ds_scope.TopBar;

__ds_ns.QuestCard = __ds_scope.QuestCard;

__ds_ns.RewardPill = __ds_scope.RewardPill;

__ds_ns.StatusTrack = __ds_scope.StatusTrack;

__ds_ns.UserChip = __ds_scope.UserChip;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

})();
