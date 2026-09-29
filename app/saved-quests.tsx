/* A sibling of notifications/quest/offers/chats, not nested under
   (tabs) — no param, one screen: the signed-in user's own saved list.
   ProfileScreen's "Saved quests" row is the one real trigger site. */
import { SavedQuestsScreen } from "@features/saved-quests/SavedQuestsScreen";

export default function SavedQuestsRoute() {
  return <SavedQuestsScreen />;
}
