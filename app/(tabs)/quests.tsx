/* Minimal placeholder — full lifecycle tracking lands with M4. No fake
   data, no badge count (that needs real offers/threads, which don't
   exist yet). */
import { Screen } from "@design/components/Screen";
import { EmptyState } from "@design/components/EmptyState";
import { t } from "../../src/i18n/t";

export default function QuestsTab() {
  return (
    <Screen title={t("tabs.quests")}>
      <EmptyState title={t("tabs.quests.comingSoon")} />
    </Screen>
  );
}
