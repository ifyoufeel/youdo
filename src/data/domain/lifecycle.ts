/* PRD §8's state machine, ported from preview/app.js:382-459
   (TRANSITIONS/canTransition/roleOn/statusMeta/isClosed) — same rows, same
   guard logic, just typed, with one addition: `draft -> open` (actor:
   poster). The web preview's own TRANSITIONS table never had this row —
   its posting wizard creates quests straight into `open`, with no
   persisted draft record to transition out of — but PRD §8's own table
   names it explicitly ("draft | open | Poster | Required fields valid;
   payment method on file"), and a real app with actual draft persistence
   (ROADMAP M3: "Draft autosave surviving app restart") needs the row to
   exist. Everything else here is an unmodified port.

   Pure and framework-free, reusable by any adapter (the memory adapter
   today, Supabase's RLS-backed guards at M7 should still agree with this
   table even though the real enforcement moves server-side there). */
import type { Quest, QuestStatus, Offer } from "../contracts";

export type Role = "poster" | "doer" | "applicant" | "visitor";
export type Actor = Role | "system" | "admin";

export interface StatusMeta {
  label: string;
  tone: "neutral" | "accent" | "warning" | "success" | "danger";
  /** -1 = not on the StatusTrack; 0/1/2 = which of its three stops. */
  track: -1 | 0 | 1 | 2;
}

export const STATUS_META: Record<QuestStatus, StatusMeta> = {
  draft: { label: "Draft", tone: "neutral", track: -1 },
  open: { label: "Open", tone: "neutral", track: -1 },
  assigned: { label: "Accepted", tone: "accent", track: 0 },
  in_progress: { label: "Doing", tone: "accent", track: 1 },
  completed: { label: "Waiting to confirm", tone: "warning", track: 1 },
  paid: { label: "Paid", tone: "success", track: 2 },
  cancelled: { label: "Cancelled", tone: "danger", track: -1 },
  expired: { label: "Expired", tone: "neutral", track: -1 },
  disputed: { label: "Disputed", tone: "danger", track: 1 },
};

export function statusMeta(s: QuestStatus): StatusMeta {
  return STATUS_META[s] ?? STATUS_META.open;
}

/** A finished quest is one nothing more will happen to. Threads on these
    are read-only (PRD §7.5) and they drop out of the active lists. */
export function isClosed(s: QuestStatus): boolean {
  return s === "paid" || s === "cancelled" || s === "expired";
}

export interface Transition {
  from: QuestStatus;
  to: QuestStatus;
  actor: Actor[];
  reason?: boolean;
}

/** PRD §8, one row per legal edge. `actor` is the viewer's relationship to
    the quest, so an illegal transition is both unreachable in the UI and
    refused by the adapter/API if something reaches for it anyway. */
export const TRANSITIONS: Transition[] = [
  { from: "draft", to: "open", actor: ["poster"] },
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
  { from: "disputed", to: "cancelled", actor: ["admin"] },
];

export function canTransition(from: QuestStatus, to: QuestStatus, actor: Actor): Transition | null {
  return TRANSITIONS.find((t) => t.from === from && t.to === to && t.actor.includes(actor)) ?? null;
}

/* ---- selectors roleOn needs — ported alongside it, same file, same
   reasoning app.js keeps them together for (app.js:427-451) ---- */

export function offersFor(offers: Offer[], questId: string): Offer[] {
  return offers.filter((o) => o.questId === questId);
}

export function pendingOffersFor(offers: Offer[], questId: string): Offer[] {
  return offersFor(offers, questId).filter((o) => o.status === "pending");
}

export function acceptedOfferFor(offers: Offer[], quest: Quest | null): Offer | null {
  if (!quest || !quest.acceptedOfferId) return null;
  return offers.find((o) => o.id === quest.acceptedOfferId) ?? null;
}

export function myOfferOn(offers: Offer[], questId: string, userId: string): Offer | null {
  const mine = offersFor(offers, questId).filter(
    (o) => o.doerId === userId && (o.status === "pending" || o.status === "accepted")
  );
  return mine[0] ?? null;
}

/** "poster" | "doer" | "applicant" | "visitor" — how the viewer relates to
    a quest. Every guard and every screen reads this, never an id
    comparison directly. */
export function roleOn(offers: Offer[], quest: Quest | null, userId: string): Role {
  if (!quest) return "visitor";
  if (quest.posterId === userId) return "poster";
  const accepted = acceptedOfferFor(offers, quest);
  if (accepted && accepted.doerId === userId) return "doer";
  if (myOfferOn(offers, quest.id, userId)) return "applicant";
  return "visitor";
}
