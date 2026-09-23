/* The 47 names, verbatim from preview/icon-names.js — a typed union so a
   typo'd name is a build-time error at every call site, not a silently
   empty icon at runtime. */
export const ICON_NAMES = [
  "search", "plus", "x", "check", "check-circle", "map-pin", "map", "clock",
  "calendar", "star", "heart", "wallet", "coins", "credit-card", "briefcase",
  "package", "chevron-right", "chevron-left", "chevron-down", "chevron-up",
  "arrow-right", "arrow-left", "message-circle", "message-square", "send",
  "bell", "user", "users", "sliders-horizontal", "filter", "home",
  "list-checks", "shield-check", "zap", "sparkles", "thumbs-up", "camera",
  "image", "pencil", "trash", "eye", "lock", "info", "alert-triangle",
  "flag", "share", "more-horizontal",
] as const;

export type IconName = (typeof ICON_NAMES)[number];
