/* Ports preview/app.js's ProfileScreen (3323-3466) in full now. M5
   shipped identity+wallet (WalletCard, the full ledger history — PRD
   §7.7, no row cap); M6 Phase 4 added the Settings entry point (its
   TopBar's sliders-horizontal IconButton). M6 Phase 5 finishes the rest:
   RatingStar + the quests/cancelRate meta line, the real "Saved quests"
   row (count + navigation, no longer a placeholder), and "What people
   said" — the signed-in user's own reveal-gated reviews, reusing
   ReviewCard from PublicProfileScreen now that this is its second real
   consumer. Unlike PublicProfileScreen, this section hides entirely when
   there's nothing to show (mine.length ? ... : null in the source) —
   your own profile doesn't need reassurance that an empty section isn't
   a bug the way a stranger's profile does. */
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@design/components/Screen";
import { Card } from "@design/components/Card";
import { Avatar } from "@design/components/Avatar";
import { IconButton } from "@design/components/IconButton";
import { Icon } from "@design/components/Icon";
import { Badge } from "@design/components/Badge";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { useRepository, useNow } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { useMyQuests } from "@features/my-quests/useMyQuests";
import { usePosters } from "@features/browse/usePosters";
import { SettingsSheet } from "@features/settings/SettingsSheet";
import { RatingStar } from "@features/reviews/RatingStar";
import { ReviewCard } from "@features/reviews/ReviewCard";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { useWallet } from "../wallet/useWallet";
import { useDeposit } from "../wallet/useDeposit";
import { useCashOut } from "../wallet/useCashOut";
import { WalletCard } from "../wallet/WalletCard";
import { WalletHistory } from "../wallet/WalletHistory";
import { DepositSheet } from "../wallet/DepositSheet";
import { CashOutSheet } from "../wallet/CashOutSheet";

const NAME_FONT = fontFamilyName(raw.font.display, raw.fontWeight.black);
const META_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const SECTION_LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const SAVED_LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);

export function ProfileScreen() {
  const router = useRouter();
  const repository = useRepository();
  const { session } = useAuthSession();
  const userId = session?.userId;
  const wallet = useWallet();
  const myQuests = useMyQuests();
  const deposit = useDeposit();
  const cashOut = useCashOut();

  const [depositOpen, setDepositOpen] = useState(false);
  const [cashOutOpen, setCashOutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const now = useNow();

  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => repository.getUser(userId as string),
    enabled: !!userId,
  });

  const savedIdsQuery = useQuery({
    queryKey: ["savedQuestIds", userId],
    queryFn: () => repository.listSavedQuestIds(userId as string),
    enabled: !!userId,
  });
  const savedCount = savedIdsQuery.data?.length ?? 0;

  const reviewsQuery = useQuery({
    queryKey: ["reviews", "for", userId],
    queryFn: () => repository.listReviewsForUser(userId as string),
    enabled: !!userId,
  });
  const myReviews = reviewsQuery.data ?? [];
  const raters = usePosters(myReviews.map((r) => r.raterId));

  if (userQuery.isLoading || wallet.isLoading) {
    return (
      <Screen title={t("tabs.profile")}>
        <LoadingState />
      </Screen>
    );
  }
  if (userQuery.isError || wallet.isError || !userQuery.data) {
    return (
      <Screen title={t("tabs.profile")}>
        <ErrorState onRetry={userQuery.refetch} />
      </Screen>
    );
  }

  const me = userQuery.data;

  const titleById = new Map<string, string>();
  for (const bucket of Object.values(myQuests.buckets)) {
    for (const e of bucket) titleById.set(e.quest.id, e.quest.title);
  }

  return (
    <Screen
      title={t("tabs.profile")}
      topBarActions={
        <IconButton
          icon="sliders-horizontal"
          accessibilityLabel={t("settings.title")}
          size="sm"
          onPress={() => setSettingsOpen(true)}
          testID="open-settings"
        />
      }
    >
      <Card padding="lg">
        <View style={styles.identityRow}>
          <Avatar name={me.name} photoUrl={me.avatarUrl} size="lg" verified={me.verified} />
          <View style={styles.identityText}>
            <Text style={styles.name}>{me.name}</Text>
            <Text style={styles.meta}>
              {t("profile.meta", { area: me.area, quests: me.questsCompleted, pct: Math.round(me.cancelRate * 100) })}
            </Text>
          </View>
          <RatingStar value={me.rating} size="lg" />
        </View>
      </Card>

      <Card padding="md" onPress={() => router.push("/saved-quests")} testID="profile-saved-quests">
        <View style={styles.savedRow}>
          <Icon name="heart" size={18} color={raw.color.flare["500"]} filled={savedCount > 0} />
          <Text style={styles.savedLabel}>{t("profile.savedQuests")}</Text>
          <Badge label={String(savedCount)} size="sm" />
          <Icon name="chevron-right" size={17} color={raw.color.ink["400"]} />
        </View>
      </Card>

      <WalletCard
        availableMinor={wallet.available}
        heldMinor={wallet.held}
        incomingMinor={wallet.incoming}
        onAddMoney={() => setDepositOpen(true)}
        onCashOut={() => setCashOutOpen(true)}
        testID="profile-wallet-card"
      />

      <Text style={styles.sectionLabel}>{t("wallet.historyTitle")}</Text>
      <WalletHistory
        history={wallet.history}
        pendingPayments={wallet.pendingPayments}
        failedPayments={wallet.failedPayments}
        now={now}
        resolveTitle={(questId) => titleById.get(questId) ?? null}
        onBrowse={() => router.push("/")}
        testID="profile-wallet-history"
      />

      {myReviews.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>{t("profile.whatPeopleSaid")}</Text>
          {myReviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              raterName={raters.get(r.raterId)?.name}
              raterPhotoUrl={raters.get(r.raterId)?.avatarUrl}
            />
          ))}
        </>
      ) : null}

      <DepositSheet
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSubmit={(amountMinor) => {
          setDepositOpen(false);
          deposit.mutate(amountMinor);
        }}
        bank={me.bank}
        availableMinor={wallet.available}
        submitting={deposit.isPending}
      />
      <CashOutSheet
        open={cashOutOpen}
        onClose={() => setCashOutOpen(false)}
        onSubmit={(amountMinor) => {
          setCashOutOpen(false);
          cashOut.mutate(amountMinor);
        }}
        bank={me.bank}
        spendableMinor={wallet.spendable}
        submitting={cashOut.isPending}
      />

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} user={me} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: NAME_FONT,
    fontSize: raw.fontSize.xl,
    letterSpacing: raw.letterSpacing.heading,
    color: semantic.color.text.primary,
  },
  meta: {
    fontFamily: META_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
    marginTop: 3,
  },
  sectionLabel: {
    fontFamily: SECTION_LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.secondary,
    marginTop: 4,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  savedLabel: {
    flex: 1,
    fontFamily: SAVED_LABEL_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
});
