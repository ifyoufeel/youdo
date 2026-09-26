/* Ports preview/app.js's MyQuestsScreen (2940-3087): three tabs (Active/
   Offers/Done) over engagementsFor(), each item a real EngagementCard.
   The post-submit confirmation toast (app.js:4134's onPosted switching
   to this tab) surfaces here via the "posted" query param usePostQuest's
   onSuccess navigates with — same per-screen toast-state pattern
   QuestDetailScreen's own offer-sent confirmation already uses, no
   auto-dismiss there either. */
import { useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen } from "@design/components/Screen";
import { EmptyState } from "@design/components/EmptyState";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { Toast } from "@design/components/Toast";
import { Tabs } from "@design/components/Tabs";
import type { Bucket } from "@data/domain/lifecycle";
import { t } from "../../i18n/t";
import { useMyQuests } from "./useMyQuests";
import { EngagementCard } from "./EngagementCard";

const EMPTY_COPY: Record<Bucket, { title: string; action: string }> = {
  active: { title: t("myQuests.empty.active.title"), action: t("myQuests.empty.active.action") },
  offers: { title: t("myQuests.empty.offers.title"), action: t("myQuests.empty.offers.action") },
  done: { title: t("myQuests.empty.done.title"), action: t("myQuests.empty.done.action") },
};

export function MyQuestsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ posted?: string }>();
  const myQuests = useMyQuests();
  const [tab, setTab] = useState<Bucket>("active");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  // Adjusted during render, not a useEffect — the "posted" param only
  // ever needs consuming once, the same shape OfferSheet's own draft-
  // reseeding uses rather than a setState-in-effect.
  const [consumedPosted, setConsumedPosted] = useState(false);
  if (params.posted === "1" && !consumedPosted) {
    setConsumedPosted(true);
    setConfirmation(t("post.postedToast"));
  }

  if (myQuests.isLoading) {
    return (
      <Screen title={t("tabs.quests")}>
        <LoadingState />
      </Screen>
    );
  }
  if (myQuests.isError) {
    return (
      <Screen title={t("tabs.quests")}>
        <ErrorState onRetry={myQuests.refetch} />
      </Screen>
    );
  }

  const list = myQuests.buckets[tab];

  return (
    <Screen title={t("tabs.quests")}>
      {confirmation ? (
        <Toast tone="success" style={styles.confirmationToast}>
          {confirmation}
        </Toast>
      ) : null}
      <Tabs
        value={tab}
        onChange={(v) => setTab(v as Bucket)}
        items={[
          { value: "active", label: t("myQuests.tab.active"), count: myQuests.buckets.active.length },
          { value: "offers", label: t("myQuests.tab.offers"), count: myQuests.buckets.offers.length },
          { value: "done", label: t("myQuests.tab.done"), count: myQuests.buckets.done.length },
        ]}
      />
      {list.length === 0 ? (
        <EmptyState
          title={EMPTY_COPY[tab].title}
          action={EMPTY_COPY[tab].action}
          onAction={() => router.push("/")}
        />
      ) : (
        list.map((e) => (
          <EngagementCard
            key={e.quest.id}
            quest={e.quest}
            role={e.role}
            amountMinor={e.amountMinor}
            counterpart={e.counterpart}
            pendingOfferCount={e.pendingOfferCount}
            now={now}
            onOpen={() => router.push(`/quest/${e.quest.id}`)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  confirmationToast: {
    marginBottom: 8,
  },
});
