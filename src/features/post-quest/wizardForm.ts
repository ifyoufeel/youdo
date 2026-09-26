/* Pure, framework-free wizard state/derivations — mirrors
   useBrowseFilters.ts's own colocated-constants-and-derivations pattern.
   Ported from preview/app.js:2472-2774 (PostQuestScreen), with Date/Time
   pickers simplified from the prototype's bespoke MonthCalendarPicker/
   TimeWheelPicker into curated option lists — both reuse Select's
   existing Dialog(sheet)+Radio mechanism (see Select.tsx's own "one
   picker pattern for the app, not two" comment) rather than porting two
   more bespoke widgets for a milestone that doesn't need them. */
import type { SelectOption } from "@design/components/Select";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const TPE_OFFSET_MS = 8 * HOUR_MS;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface PostQuestForm {
  title: string;
  details: string;
  categoryId: string;
  address: string;
  area: string;
  date: string; // "YYYY-MM-DD", Taipei calendar date
  time: string; // "HH:MM", 24h
  minutes: string; // DURATIONS value
  expiry: string; // EXPIRY_OPTIONS value
  budget: string; // decimal NTD string, as typed
}

export function emptyForm(defaultArea: string): PostQuestForm {
  return {
    title: "",
    details: "",
    categoryId: "",
    address: "",
    area: defaultArea,
    date: "",
    time: "",
    minutes: "60",
    expiry: "before",
    budget: "",
  };
}

/** value/label/minutes, `open: true` marking the estimates that are a
    floor rather than a figure (ported verbatim, app.js:2487-2500). The
    estimate tells a doer what they're taking on; it does not price the
    quest (ADR-011). */
export interface DurationOption {
  value: string;
  label: string;
  minutes: number;
  open?: true;
}

export const DURATIONS: DurationOption[] = [
  { value: "20", label: "~20 min", minutes: 20 },
  { value: "30", label: "~30 min", minutes: 30 },
  { value: "45", label: "~45 min", minutes: 45 },
  { value: "60", label: "~1 hr", minutes: 60 },
  { value: "120", label: "~2 hr", minutes: 120 },
  { value: "180", label: "~3 hr", minutes: 180 },
  { value: "240", label: "~4 hr", minutes: 240 },
  { value: "300", label: "~5 hr", minutes: 300 },
  { value: "360", label: "~6 hr", minutes: 360 },
  { value: "360plus", label: "6+ hr", minutes: 360, open: true },
  { value: "720plus", label: "12+ hr", minutes: 720, open: true },
  { value: "allday", label: "All day", minutes: 480, open: true },
];

export function durationOption(value: string): DurationOption {
  return DURATIONS.find((d) => d.value === value) ?? DURATIONS[3];
}

/** PRD §14.4 hasn't settled the default expiry window — ported verbatim,
    app.js:2512-2516. */
export interface ExpiryOption {
  value: string;
  label: string;
}

export const EXPIRY_OPTIONS: ExpiryOption[] = [
  { value: "before", label: "An hour before it starts" },
  { value: "24h", label: "In 24 hours" },
  { value: "start", label: "When it starts" },
];

export function expiryOption(value: string): ExpiryOption {
  return EXPIRY_OPTIONS.find((e) => e.value === value) ?? EXPIRY_OPTIONS[0];
}

function tpeDateParts(t: number): { y: number; m: number; d: number } {
  const d = new Date(t + TPE_OFFSET_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
}

function isoDate(t: number): string {
  const { y, m, d } = tpeDateParts(t);
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** The next 14 Taipei calendar days starting today, a curated stand-in
    for the prototype's MonthCalendarPicker. */
export function dateOptions(now: number): SelectOption[] {
  const options: SelectOption[] = [];
  for (let i = 0; i < 14; i++) {
    const t = now + i * DAY_MS;
    const value = isoDate(t);
    let label: string;
    if (i === 0) label = "Today";
    else if (i === 1) label = "Tomorrow";
    else {
      const parts = tpeDateParts(t);
      const weekday = WEEKDAYS[new Date(t + TPE_OFFSET_MS).getUTCDay()];
      label = `${weekday}, ${parts.d} ${MONTHS[parts.m]}`;
    }
    options.push({ value, label });
  }
  return options;
}

function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

/** 30-minute increments across a day-time range, a curated stand-in for
    the prototype's TimeWheelPicker. */
export function timeOptions(): SelectOption[] {
  const options: SelectOption[] = [];
  for (let h = 7; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) continue;
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      options.push({ value, label: formatTime12(value) });
    }
  }
  return options;
}

export function tpeISO(date: string, time: string): string {
  return `${date}T${time}:00+08:00`;
}

/** Ported from app.js:2624-2628. */
export function expiryISO(scheduledISO: string, expiry: string, now: number): string {
  if (expiry === "start") return scheduledISO;
  if (expiry === "24h") return new Date(now + 24 * HOUR_MS).toISOString();
  return new Date(Date.parse(scheduledISO) - HOUR_MS).toISOString();
}

/** A draft is only a draft once something has been typed into it —
    without this, an emptied form still counts as one, and the wizard
    greets an empty screen with "picked up where you left off"
    (app.js:2535-2539). */
export function draftHasContent(form: PostQuestForm): boolean {
  return Boolean(
    form.title.trim() || form.details.trim() || form.address.trim() || form.budget.trim() || form.date || form.time
  );
}

export interface WizardErrors {
  title: string | null;
  address: string | null;
  when: string | null;
  budget: string | null;
}

/** Ported verbatim, app.js:2602-2611. */
export function computeErrors(form: PostQuestForm): WizardErrors {
  const budgetMinor = Math.max(0, Math.round(parseFloat(form.budget || "0") * 100));
  return {
    title: form.title.trim().length < 8 ? "Give it a few more words so doers know what's involved" : null,
    address: form.address.trim() === "" ? "Add an address so doers know how far it is" : null,
    when: !form.date || !form.time ? "Pick a date and a time" : null,
    budget: budgetMinor <= 0 ? "Name a price so doers know what's on offer" : null,
  };
}

export const POST_STEPS = ["what", "where", "budget", "review"] as const;
export type PostStepKey = (typeof POST_STEPS)[number];

const STEP_FIELDS: Record<PostStepKey, (keyof WizardErrors)[]> = {
  what: ["title"],
  where: ["address", "when"],
  budget: ["budget"],
  review: [],
};

export function isStepValid(step: number, errors: WizardErrors): boolean {
  return STEP_FIELDS[POST_STEPS[step]].every((f) => !errors[f]);
}

export function budgetMinorOf(form: PostQuestForm): number {
  return Math.max(0, Math.round(parseFloat(form.budget || "0") * 100));
}
