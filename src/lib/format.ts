/* The other two legs of "the one formatting boundary" (PRD §11) —
   formatMoney lives with the Money type itself (src/data/contracts/money.ts);
   distance/duration/when belong here since they're not tied to a single
   contract. Ports preview/app.js's formatDistance/formatDuration/
   formatWhenAt (lines 43-48, 332-342) verbatim, including Taipei's fixed
   UTC+8 offset (no DST to model — PRD scopes this launch to Taipei only). */
const HOUR_MS = 60 * 60 * 1000;
const TPE_OFFSET_MS = 8 * HOUR_MS;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDistance(m: number): string {
  return m >= 1000 ? (m / 1000).toFixed(1) + " km" : Math.round(m / 100) * 100 + " m";
}

export function formatDuration(min: number): string {
  return min >= 120 ? "~" + Math.round(min / 60) + " hr" : "~" + min + " min";
}

interface TpeParts {
  y: number;
  m: number;
  d: number;
  hh: number;
  mm: number;
  wd: number;
}

function tpeParts(t: number): TpeParts {
  const d = new Date(t + TPE_OFFSET_MS);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth(),
    d: d.getUTCDate(),
    hh: d.getUTCHours(),
    mm: d.getUTCMinutes(),
    wd: d.getUTCDay(),
  };
}

function sameTpeDay(a: number, b: number): boolean {
  const p = tpeParts(a);
  const q = tpeParts(b);
  return p.y === q.y && p.m === q.m && p.d === q.d;
}

function clockLabel(p: TpeParts): string {
  const ap = p.hh >= 12 ? "pm" : "am";
  const h12 = p.hh % 12 === 0 ? 12 : p.hh % 12;
  return h12 + (p.mm ? ":" + String(p.mm).padStart(2, "0") : "") + ap;
}

/** `now` is a device-clock timestamp (ms), same "now" the memory adapter's
    own todayOnly filter uses — see quests.ts's isToday(). */
export function formatWhenAt(iso: string, now: number): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  const p = tpeParts(t);
  const time = clockLabel(p);
  if (sameTpeDay(t, now)) return "Today, " + time;
  if (sameTpeDay(t, now + 24 * HOUR_MS)) return "Tomorrow, " + time;
  if (sameTpeDay(t, now - 24 * HOUR_MS)) return "Yesterday, " + time;
  if (t > now && t - now < 7 * 24 * HOUR_MS) return WEEKDAYS[p.wd] + ", " + time;
  return p.d + " " + MONTHS[p.m] + ", " + time;
}

/** Coarse on purpose — a live second hand on a 72-hour window is drama, not
    information. Returns null once the deadline has passed. */
export function formatRemaining(untilIso: string, now: number): string | null {
  const left = Date.parse(untilIso) - now;
  if (left <= 0) return null;
  if (left < HOUR_MS) return Math.max(1, Math.round(left / 60000)) + " min";
  if (left < 48 * HOUR_MS) return Math.round(left / HOUR_MS) + " hr";
  return Math.round(left / (24 * HOUR_MS)) + " days";
}
