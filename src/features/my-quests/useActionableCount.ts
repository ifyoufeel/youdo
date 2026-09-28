/* My-quests tab badge count — reuses useMyQuests's already-fetched data
   rather than a second parallel N+1 fetch. M5 adds poster+completed
   ("Confirm and pay" is now real) to the M4 set (poster+open with
   pending offers, doer+assigned/in_progress); paid+unrated ("Leave a
   rating") stays out (M6, no rating actor yet), same scope
   EngagementCard's own primary() action-selector already applies. */
import { useMyQuests } from "./useMyQuests";

export function useActionableCount(): number {
  const myQuests = useMyQuests();
  return myQuests.buckets.active.filter((e) => {
    if (e.role === "poster") return (e.quest.status === "open" && e.pendingOfferCount > 0) || e.quest.status === "completed";
    if (e.role === "doer") return e.quest.status === "assigned" || e.quest.status === "in_progress";
    return false;
  }).length;
}
