/* A sibling of (tabs)/(onboarding), not nested under (tabs) — a quest
   detail screen has no tab bar, same reasoning (onboarding) already sits
   outside (tabs). */
import { useLocalSearchParams } from "expo-router";
import { QuestDetailScreen } from "@features/quest-detail/QuestDetailScreen";

export default function QuestDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <QuestDetailScreen questId={id} />;
}
