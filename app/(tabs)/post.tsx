/* Minimal placeholder — the posting wizard lands with M3. */
import { Screen } from "@design/components/Screen";
import { EmptyState } from "@design/components/EmptyState";
import { t } from "../../src/i18n/t";

export default function PostTab() {
  return (
    <Screen title={t("tabs.post")}>
      <EmptyState title={t("tabs.post.comingSoon")} />
    </Screen>
  );
}
