/* ADR-009's "one pure function that runs whenever the clock moves" —
   ported from preview/app.js's runClock (651-704), split into planning
   (here, pure) and applying (adapters/memory/advance-clock.ts, which has
   the side effects: escrow, notifications). Two independent sweeps, same
   as the prototype: expire stale open quests (and their pending offers),
   and auto-release completed quests once the 72h confirm window has
   passed with no dispute. */
import type { Quest, Offer } from "../contracts";
import { offersFor, acceptedOfferFor, confirmDeadline } from "./lifecycle";

export interface SweepPlan {
  expire: { questId: string; pendingOfferIds: string[] }[];
  release: { questId: string; offerId: string }[];
}

export function planSweep(quests: Quest[], offers: Offer[], nowMs: number): SweepPlan {
  const expire: SweepPlan["expire"] = [];
  const release: SweepPlan["release"] = [];

  for (const quest of quests) {
    if (quest.status === "open" && Date.parse(quest.expiresAt) <= nowMs) {
      const pendingOfferIds = offersFor(offers, quest.id)
        .filter((o) => o.status === "pending")
        .map((o) => o.id);
      expire.push({ questId: quest.id, pendingOfferIds });
      continue;
    }

    if (quest.status === "completed") {
      const deadline = confirmDeadline(quest);
      // No accepted offer to release against is not reachable in
      // practice (a quest only reaches "completed" via markDone, which
      // requires one), but skip rather than crash if it somehow is —
      // matches the prototype's own defensive shape here.
      const accepted = acceptedOfferFor(offers, quest);
      if (deadline && Date.parse(deadline) <= nowMs && accepted) {
        release.push({ questId: quest.id, offerId: accepted.id });
      }
    }
  }

  return { expire, release };
}
