/* Minimal placeholder — real per-thread messaging lands with M4. */
import { Screen } from "@design/components/Screen";
import { EmptyState } from "@design/components/EmptyState";
import { t } from "../../src/i18n/t";

export default function ChatsTab() {
  return (
    <Screen title={t("tabs.chats")}>
      <EmptyState title={t("tabs.chats.comingSoon")} />
    </Screen>
  );
}
