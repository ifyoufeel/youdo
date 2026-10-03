/* A sibling of (tabs)/(onboarding)/quest/[id], not nested under (tabs) —
   a profile detail screen has no tab bar, same reasoning quest/[id].tsx
   already gives. */
import { useLocalSearchParams } from "expo-router";
import { PublicProfileScreen } from "@features/public-profile/PublicProfileScreen";

export default function PublicProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PublicProfileScreen userId={id} />;
}
