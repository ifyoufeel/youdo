/* Ports preview/app.js's SavedScreen (3579-3608) — the saved list,
   reusing QuestCard exactly as BrowseScreen does (same "spacious"
   variant, same questBadges derivation for an open quest; a closed one
   shows its real status badge instead, matching the prototype's own
   `gone` branch). */
import { useRouter } from "expo-router";
import { Screen } from "@design/components/Screen";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { EmptyState } from "@design/components/EmptyState";
import { QuestCard } from "@design/components/QuestCard";
import { useNow } from "@data/composition-root";
import { money, formatMoney } from "@data/contracts";
import { statusMeta } from "@data/domain/lifecycle";
import { questDuration, formatWhenAt } from "@lib/format";
import { questBadges } from "@lib/questBadges";
import { t } from "../../i18n/t";
import { useSavedQuests } from "./useSavedQuests";
import { useSaveQuest } from "@features/browse/useSaveQuest";

export function SavedQuestsScreen() {
  const router = useRouter();
  const now = useNow();
  const saved = useSavedQuests();
  const { toggleSave } = useSaveQuest();

  if (saved.isLoading) {
    return (
      <Screen title={t("savedQuests.title")} onBack={() => router.back()}>
        <LoadingState />
      </Screen>
    );
  }
  if (saved.isError) {
    return (
      <Screen title={t("savedQuests.title")} onBack={() => router.back()}>
        <ErrorState />
      </Screen>
    );
  }

  return (
    <Screen title={t("savedQuests.title")} onBack={() => router.back()}>
      {saved.quests.length === 0 ? (
        <EmptyState
          title={t("savedQuests.empty.title")}
          action={t("savedQuests.empty.action")}
          onAction={() => router.push("/")}
        />
      ) : (
        saved.quests.map((q) => {
          const poster = saved.posters.get(q.posterId);
          const gone = q.status !== "open";
          const meta = statusMeta(q.status);
          return (
            <QuestCard
              key={q.id}
              variant="spacious"
              title={q.title}
              payout={formatMoney(money(q.payoutMinor))}
              duration={questDuration(q)}
              when={formatWhenAt(q.scheduledFor, now)}
              badges={gone ? [{ label: meta.label, tone: meta.tone }] : questBadges(q, now)}
              poster={
                poster
                  ? {
                      name: poster.name,
                      photoUrl: poster.avatarUrl,
                      rating: poster.rating,
                      questsCompleted: poster.questsCompleted,
                      verified: poster.verified,
                    }
                  : undefined
              }
              saved
              onSave={() => toggleSave(q.id, true)}
              onPress={() => router.push(`/quest/${q.id}`)}
            />
          );
        })
      )}
    </Screen>
  );
}
