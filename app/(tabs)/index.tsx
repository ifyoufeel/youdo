/* Temporary placeholder — Phase 8 (M1) replaces this with the real
   BrowseScreen from src/features/browse/. Kept inline like the other
   placeholder tabs since it's fully replaced shortly, not a feature
   worth its own src/features indirection yet. */
import { Screen } from "@design/components/Screen";
import { EmptyState } from "@design/components/EmptyState";
import { t } from "../../src/i18n/t";

export default function BrowseTab() {
  return (
    <Screen title={t("tabs.browse")}>
      <EmptyState title={t("tabs.browse.comingSoon")} />
    </Screen>
  );
}
