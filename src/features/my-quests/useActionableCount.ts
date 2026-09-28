/* My-quests tab badge count — reuses useMyQuests's already-fetched data
   rather than a second parallel N+1 fetch. Scoped to what's real in M4:
   poster+open with pending offers, or doer+assigned/in_progress — the
   poster+completed ("Confirm and pay") and paid+unrated ("Leave a
   rating") branches stay out (M5/M6), same scope EngagementCard's own
   primary() action-selector already applies. */
import { useMyQuests } from "./useMyQuests";

export function useActionableCount(): number {
  const myQuests = useMyQuests();
  return myQuests.buckets.active.filter((e) => {
    if (e.role === "poster") return e.quest.status === "open" && e.pendingOfferCount > 0;
    if (e.role === "doer") return e.quest.status === "assigned" || e.quest.status === "in_progress";
    return false;
  }).length;
}
