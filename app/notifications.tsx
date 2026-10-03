/* A sibling of quest/offers/chats, not nested under (tabs) — no param,
   since every bell in the app (MyQuestsScreen, ChatsScreen) opens this
   same one screen. */
import { NotificationsScreen } from "@features/notifications/NotificationsScreen";

export default function NotificationsRoute() {
  return <NotificationsScreen />;
}
