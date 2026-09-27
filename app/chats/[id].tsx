/* A sibling of (tabs)/(onboarding)/quest/offers, not nested under (tabs)
   — same reasoning app/quest/[id].tsx already established. `id` is the
   threadId. app/(tabs)/chats.tsx stays the thread-LIST tab. */
import { useLocalSearchParams } from "expo-router";
import { ThreadScreen } from "@features/chats/ThreadScreen";

export default function ThreadRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ThreadScreen threadId={id} />;
}
