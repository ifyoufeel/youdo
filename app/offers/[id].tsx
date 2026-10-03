/* A sibling of (tabs)/(onboarding)/quest, not nested under (tabs) — same
   reasoning app/quest/[id].tsx already established for a detail screen
   with no tab bar. `id` is the questId, not an offer id — the inbox is
   always scoped to one quest's own offers. */
import { useLocalSearchParams } from "expo-router";
import { OfferInboxScreen } from "@features/offer-inbox/OfferInboxScreen";

export default function OfferInboxRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OfferInboxScreen questId={id} />;
}
