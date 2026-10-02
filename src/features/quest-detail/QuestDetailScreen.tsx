/* Ports preview/app.js's QuestDetailScreen (1760-2073). M2 scoped this to
   payout, meta rows, description, requirements, poster trust panel,
   offer count, address privacy, and the offer sheet. M4 added the
   poster's real "Review offers" button and Start quest/Mark as done/
   Cancel. M5 added the poster's "Confirm and pay". M6 adds "Leave a
   rating" (paid + unrated, either side) — "Issue" (dispute) stays
   unwired, no admin actor exists to resolve one. ConfirmWindow (Phase 2)
   already covers "completed" informationally in the body regardless of
   role. */
import { useState, type ReactNode } from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuthSession } from "@data/auth-session";
import { useNow } from "@data/composition-root";
import { Screen } from "@design/components/Screen";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { EmptyState } from "@design/components/EmptyState";
import { Card } from "@design/components/Card";
import { Badge } from "@design/components/Badge";
import { RewardPill } from "@design/components/RewardPill";
import { UserChip } from "@design/components/UserChip";
import { InfoRow } from "@design/components/InfoRow";
import { Button } from "@design/components/Button";
import { IconButton } from "@design/components/IconButton";
import { Icon } from "@design/components/Icon";
import { Toast } from "@design/components/Toast";
import { ConfirmWindow } from "@design/components/ConfirmWindow";
import { money, formatMoney } from "@data/contracts";
import { statusMeta, acceptedOfferFor } from "@data/domain/lifecycle";
import { netOn } from "@data/domain/fees";
import { questDuration, formatWhenAt } from "@lib/format";
import { questBadges } from "@lib/questBadges";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { useQuestDetail } from "./useQuestDetail";
import { useSendOffer } from "./useSendOffer";
import { useWithdrawOffer } from "./useWithdrawOffer";
import { useStartQuest } from "./useStartQuest";
import { useMarkDone } from "./useMarkDone";
import { useConfirmDone } from "./useConfirmDone";
import { useCancelQuest } from "./useCancelQuest";
import { useQuestThread } from "./useQuestThread";
import { OfferSheet } from "./OfferSheet";
import { CancelSheet } from "./CancelSheet";
import { RateSheet } from "@features/reviews/RateSheet";
import { useSubmitReview } from "@features/reviews/useSubmitReview";

const TITLE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const SECTION_LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const AMOUNT_FONT = fontFamilyName(raw.font.display, raw.fontWeight.black);

export interface QuestDetailScreenProps {
  questId: string;
}

export function QuestDetailScreen({ questId }: QuestDetailScreenProps) {
  const router = useRouter();
  const { session } = useAuthSession();
  const detail = useQuestDetail(questId);
  const sendOffer = useSendOffer();
  const withdrawOffer = useWithdrawOffer(questId);
  const startQuest = useStartQuest();
  const markDone = useMarkDone();
  const confirmDone = useConfirmDone();
  const cancelQuest = useCancelQuest(questId);
  const submitReview = useSubmitReview();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false);
  const [rateSheetOpen, setRateSheetOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const now = useNow();

  // Computed before the early returns below (useQuestThread is a hook,
  // so it must run every render) from useQuestDetail's own null-safe
  // fallbacks — roleOn/acceptedOfferFor both already handle a still-
  // loading (null) quest.
  const actorId = session?.userId;
  const acceptedOfferForThread = detail.quest ? acceptedOfferFor(detail.offers, detail.quest) : null;
  const doerIdForThread = detail.role === "poster" ? (acceptedOfferForThread?.doerId ?? null) : (actorId ?? null);
  const thread = useQuestThread(questId, doerIdForThread);

  if (detail.isLoading) {
    return (
      <Screen title={t("tabs.quests")} onBack={() => router.back()}>
        <LoadingState />
      </Screen>
    );
  }

  if (detail.isError) {
    return (
      <Screen onBack={() => router.back()}>
        <ErrorState onRetry={detail.refetch} />
      </Screen>
    );
  }

  if (!detail.quest) {
    return (
      <Screen onBack={() => router.back()}>
        <EmptyState title="This quest no longer exists" />
      </Screen>
    );
  }

  const { quest, poster, counterpart, myReview, role, addressVisible, myOffer } = detail;
  const meta = statusMeta(quest.status);
  const badges = quest.status === "open" ? questBadges(quest, now) : [{ label: meta.label, tone: meta.tone }];
  const pendingCount = detail.offers.filter((o) => o.status === "pending").length;
  const canOffer = detail.isSignedIn && role === "visitor" && quest.status === "open";
  const acceptedOffer = acceptedOfferForThread;

  function runCancel(reason: string) {
    if (!actorId) return;
    cancelQuest.mutate(
      { actorId, reason },
      { onSuccess: () => setCancelSheetOpen(false) }
    );
  }

  let slab: ReactNode = undefined;
  if (canOffer) {
    slab = (
      <>
        <Button variant="secondary" onPress={() => setSheetOpen(true)}>
          {t("questDetail.ask")}
        </Button>
        <Button variant="primary" fullWidth onPress={() => setSheetOpen(true)}>
          {t("questDetail.takeQuest")}
        </Button>
      </>
    );
  } else if (role === "poster" && (quest.status === "assigned" || quest.status === "in_progress") && actorId) {
    slab = (
      <>
        <Button variant="secondary" onPress={() => setCancelSheetOpen(true)} testID="cancel-quest-slab">
          {t("questDetail.cancel")}
        </Button>
        {thread ? (
          <Button variant="primary" fullWidth icon="message-circle" onPress={() => router.push(`/chats/${thread.id}`)} testID="open-chat">
            {t("questDetail.openChat")}
          </Button>
        ) : null}
      </>
    );
  } else if (role === "doer" && quest.status === "assigned" && actorId) {
    slab = (
      <>
        <Button variant="secondary" onPress={() => setCancelSheetOpen(true)} testID="cancel-quest-slab">
          {t("questDetail.cancel")}
        </Button>
        <Button
          variant="primary"
          fullWidth
          icon="zap"
          onPress={() => startQuest.mutate({ questId, actorId })}
          disabled={startQuest.isPending}
          testID="start-quest"
        >
          {t("questDetail.startQuest")}
        </Button>
      </>
    );
  } else if (role === "doer" && quest.status === "in_progress" && actorId) {
    slab = (
      <>
        <Button variant="secondary" onPress={() => setCancelSheetOpen(true)} testID="cancel-quest-slab">
          {t("questDetail.cancel")}
        </Button>
        <Button
          variant="primary"
          fullWidth
          icon="check"
          onPress={() => markDone.mutate({ questId, actorId })}
          disabled={markDone.isPending}
          testID="mark-as-done"
        >
          {t("questDetail.markAsDone")}
        </Button>
      </>
    );
  } else if (role === "poster" && quest.status === "completed" && actorId) {
    // No Cancel here either — completed->cancelled isn't a legal
    // transition for either role (see the doer/applicant branch below).
    slab = (
      <Button
        variant="money"
        fullWidth
        icon="check"
        onPress={() =>
          confirmDone.mutate(
            { questId, actorId },
            {
              onSuccess: () => {
                if (acceptedOffer) {
                  setConfirmation(
                    t("questDetail.confirmedToast", { amount: formatMoney(money(netOn(acceptedOffer.amountMinor))) })
                  );
                }
              },
            }
          )
        }
        disabled={confirmDone.isPending}
        testID="confirm-and-pay"
      >
        {t("questDetail.confirmAndPay")}
      </Button>
    );
  } else if ((role === "doer" && quest.status === "completed") || role === "applicant") {
    // No Cancel here — cancelling from "completed" isn't a legal
    // transition (TRANSITIONS has no completed->cancelled row for either
    // role), and an applicant's own withdraw action is already a body
    // action, not a slab one (unchanged since M2).
    slab = thread ? (
      <Button variant="secondary" fullWidth icon="message-circle" onPress={() => router.push(`/chats/${thread.id}`)} testID="open-chat">
        {t("questDetail.openChat")}
      </Button>
    ) : undefined;
  } else if (quest.status === "paid" && (role === "poster" || role === "doer") && !myReview && actorId) {
    slab = (
      <Button variant="money" fullWidth icon="star" onPress={() => setRateSheetOpen(true)} testID="leave-a-rating">
        {t("questDetail.leaveARating")}
      </Button>
    );
  }

  return (
    <Screen title={quest.title} onBack={() => router.back()} slab={slab}>
      {confirmation ? (
        <Toast tone="success" style={styles.confirmationToast}>
          {confirmation}
        </Toast>
      ) : null}

      <Card padding="md">
        <View style={styles.badgeRow}>
          {badges.map((b) => (
            <Badge key={b.label} label={b.label} tone={b.tone} icon={b.icon} />
          ))}
        </View>
        <Text style={styles.title}>{quest.title}</Text>
        <RewardPill amount={formatMoney(money(quest.payoutMinor))} size="lg" style={styles.rewardPill} />
        {quest.details ? <Text style={styles.description}>{quest.details}</Text> : null}
        {quest.photos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosRow}>
            {quest.photos.map((url, i) => (
              <Image key={url} source={{ uri: url }} style={styles.photoImage} resizeMode="cover" testID={`quest-photo-${i}`} />
            ))}
          </ScrollView>
        ) : null}
      </Card>

      <Card padding="md">
        {addressVisible ? (
          <View style={styles.addressRow}>
            <Icon name="map-pin" size={16} />
            <Text style={styles.addressText}>
              {quest.addressLine}, {quest.area}
            </Text>
          </View>
        ) : (
          <View style={styles.addressRow}>
            <Icon name="lock" size={16} />
            <Text style={styles.addressHiddenText}>{t("questDetail.addressHidden")}</Text>
          </View>
        )}
      </Card>

      <Card padding="md">
        <InfoRow label={t("questDetail.meta.duration")} value={questDuration(quest)} />
        <InfoRow label={t("questDetail.meta.when")} value={formatWhenAt(quest.scheduledFor, now)} />
        {quest.status === "open" ? (
          <InfoRow label={t("questDetail.meta.offersClose")} value={formatWhenAt(quest.expiresAt, now)} />
        ) : null}
      </Card>

      {quest.status === "completed" ? <ConfirmWindow quest={quest} now={now} doerSide={role === "doer"} /> : null}

      {quest.requirements.length > 0 ? (
        <Card variant="sunken" padding="md">
          <Text style={styles.sectionLabel}>{t("questDetail.requirementsTitle")}</Text>
          {quest.requirements.map((r) => (
            <Text key={r} style={styles.requirement}>
              • {r}
            </Text>
          ))}
        </Card>
      ) : null}

      {role === "poster" ? (
        <Card padding="md">
          <Text style={styles.offerCount}>
            {pendingCount === 0
              ? t("questDetail.offerCount.none")
              : t("questDetail.offerCount.some", { count: pendingCount, noun: pendingCount === 1 ? "offer" : "offers" })}
          </Text>
          {quest.status === "open" ? (
            <Button
              variant={pendingCount > 0 ? "primary" : "secondary"}
              style={styles.reviewOffersButton}
              onPress={() => router.push(`/offers/${questId}`)}
              testID="review-offers"
            >
              {pendingCount > 0
                ? t("questDetail.reviewOffersCount", { count: pendingCount, noun: pendingCount === 1 ? "offer" : "offers" })
                : t("questDetail.reviewOffers")}
            </Button>
          ) : null}
        </Card>
      ) : poster ? (
        <Card padding="md">
          <View style={styles.trustPanelRow}>
            <UserChip
              name={poster.name}
              photoUrl={poster.avatarUrl}
              rating={poster.rating}
              questsCompleted={poster.questsCompleted}
              verified={poster.verified}
              meta={role === "doer" ? t("questDetail.doingThisQuest") : t("questDetail.postedThisQuest")}
              style={styles.trustPanelChip}
            />
            <IconButton
              icon="user"
              accessibilityLabel={t("questDetail.seeProfile")}
              size="sm"
              onPress={() => router.push(`/profile/${poster.id}`)}
              testID="see-profile"
            />
          </View>
          <View style={styles.trustBadgeRow}>
            {poster.verified ? <Badge label={t("questDetail.verifiedBadge")} tone="accent" icon="shield-check" /> : null}
            <Badge label={t("questDetail.cancelRate", { pct: Math.round(poster.cancelRate * 100) })} tone="neutral" />
          </View>
        </Card>
      ) : null}

      {role === "applicant" && myOffer ? (
        <Card variant="accent" padding="md">
          <Text style={styles.myOfferAmount}>{t("questDetail.myOffer", { amount: formatMoney(money(myOffer.amountMinor)) })}</Text>
          {myOffer.note ? <Text style={styles.myOfferNote}>{myOffer.note}</Text> : null}
          {myOffer.status === "pending" ? (
            <Button
              variant="ghost"
              onPress={() => withdrawOffer.mutate(myOffer.id)}
              disabled={withdrawOffer.isPending}
              testID="withdraw-offer"
            >
              {t("questDetail.withdraw")}
            </Button>
          ) : null}
        </Card>
      ) : null}

      {canOffer ? <Text style={styles.disclaimer}>{t("questDetail.visitorDisclaimer")}</Text> : null}

      {poster ? (
        <OfferSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          askingPriceMinor={quest.payoutMinor}
          posterName={poster.name}
          submitting={sendOffer.isPending}
          errorMessage={sendOffer.error instanceof Error ? sendOffer.error.message : null}
          onSubmit={(amountMinor, note) => {
            // canOffer already requires isSignedIn before this sheet can
            // even open, but never trust a stale closure over a real
            // session — a session that signs out while the sheet is open
            // should silently no-op the submit, not force-unwrap null.
            if (!session) return;
            sendOffer.mutate(
              { questId, doerId: session.userId, amountMinor, note },
              {
                onSuccess: () => {
                  setSheetOpen(false);
                  setConfirmation(t("offer.sentToast", { posterName: poster.name }));
                },
              }
            );
          }}
        />
      ) : null}

      <CancelSheet
        open={cancelSheetOpen}
        onClose={() => setCancelSheetOpen(false)}
        refundMinor={acceptedOffer ? acceptedOffer.amountMinor : null}
        onConfirm={runCancel}
        submitting={cancelQuest.isPending}
      />

      <RateSheet
        open={rateSheetOpen}
        onClose={() => setRateSheetOpen(false)}
        counterpart={counterpart}
        submitting={submitReview.isPending}
        onConfirm={(rating, comment) => {
          if (!actorId || !counterpart) return;
          submitReview.mutate(
            { questId, raterId: actorId, rateeId: counterpart.id, rating, comment },
            {
              onSuccess: () => {
                setRateSheetOpen(false);
                setConfirmation(t("questDetail.ratedToast", { name: counterpart.name }));
              },
            }
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  title: {
    fontFamily: TITLE_FONT,
    fontSize: raw.fontSize.xl,
    letterSpacing: raw.letterSpacing.heading,
    color: semantic.color.text.primary,
  },
  rewardPill: {
    alignSelf: "flex-start",
  },
  description: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.md,
    lineHeight: raw.fontSize.md * raw.lineHeight.normal,
    color: semantic.color.text.primary,
  },
  photosRow: {
    marginTop: 8,
  },
  photoImage: {
    width: 96,
    height: 96,
    borderRadius: raw.radius.md,
    marginRight: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressText: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  addressHiddenText: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.secondary,
    flexShrink: 1,
  },
  sectionLabel: {
    fontFamily: SECTION_LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.secondary,
  },
  requirement: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  offerCount: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  reviewOffersButton: {
    marginTop: 10,
  },
  trustPanelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trustPanelChip: {
    flex: 1,
    minWidth: 0,
  },
  trustBadgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  myOfferAmount: {
    fontFamily: AMOUNT_FONT,
    fontSize: raw.fontSize.lg,
    fontVariant: ["tabular-nums"],
    color: raw.color.ink["900"],
  },
  myOfferNote: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  disclaimer: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize["2xs"],
    textAlign: "center",
    color: semantic.color.text.secondary,
  },
  confirmationToast: {
    marginBottom: 8,
  },
});
