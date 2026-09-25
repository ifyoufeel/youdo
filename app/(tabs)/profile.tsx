/* Minimal placeholder — profile, trust and settings land with M6. */
import { Screen } from "@design/components/Screen";
import { EmptyState } from "@design/components/EmptyState";
import { t } from "../../src/i18n/t";

export default function ProfileTab() {
  return (
    <Screen title={t("tabs.profile")}>
      <EmptyState title={t("tabs.profile.comingSoon")} />
    </Screen>
  );
}
