/* Ports preview/app.js's questBadges (1547-1559) verbatim: badges are
   derived from the quest + the clock, never stored — a fixture that baked
   in "Ends in 2h" as a string would go stale the moment the clock moves. */
import type { Quest } from "@data/contracts";
import type { QuestCardBadge } from "@design/components/QuestCard";
import { formatRemaining } from "@lib/format";

const HOUR_MS = 60 * 60 * 1000;

export function questBadges(quest: Quest, now: number): QuestCardBadge[] {
  const out: QuestCardBadge[] = [];
  const left = quest.expiresAt ? Date.parse(quest.expiresAt) - now : null;
  if (left !== null && left > 0 && left <= 3 * HOUR_MS) {
    out.push({ label: "Ends in " + formatRemaining(quest.expiresAt, now), tone: "hot", icon: "clock" });
  } else if (now - Date.parse(quest.createdAt) <= 3 * HOUR_MS) {
    out.push({ label: "New", tone: "accent" });
  }
  if ((quest.requirements || []).some((r) => /drill|tools?\b/i.test(r))) {
    out.push({ label: "Tools needed", tone: "warning", icon: "briefcase" });
  }
  return out;
}
