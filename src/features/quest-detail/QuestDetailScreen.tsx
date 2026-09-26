/* Ports preview/app.js's QuestDetailScreen (1760-2073), scoped to what
   M2 actually needs: payout, meta rows, description, requirements,
   poster trust panel, offer count, address privacy, and the offer sheet
   itself. Everything else that screen does — the poster's "Review
   offers" button (a separate accept/decline inbox), the doer's "Start
   quest"/"Mark as done" lifecycle actions, the completed/paid fee
   breakdown and rating card — needs mutations or screens M4/M5/M6 build,
   not this milestone; the slab below only ever renders a visitor's offer
   CTAs or an applicant's withdraw action, per this milestone's own scope
   call (see the M2 plan's "slab actions scoped to what's real"). */
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuthSession } from "@data/auth-session";
import { Screen } from "@design/components/Screen";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { EmptyState } from "@design/components/EmptyState";
import { Card } from "@design/components/Card";
import { Badge } from "@design/components/Badge";
import { RewardPill } from "@design/components/RewardPill";
import { UserChip } from "@design/components/UserChip";
import { Button } from "@design/components/Button";
import { Icon } from "@design/components/Icon";
import { Toast } from "@design/components/Toast";
import { money, formatMoney } from "@data/contracts";
import { statusMeta } from "@data/domain/lifecycle";
import { formatDuration, formatWhenAt } from "@lib/format";
import { questBadges } from "@lib/questBadges";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { useQuestDetail } from "./useQuestDetail";
import { useSendOffer } from "./useSendOffer";
import { useWithdrawOffer } from "./useWithdrawOffer";
import { OfferSheet } from "./OfferSheet";

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

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

  const { quest, poster, role, addressVisible, myOffer } = detail;
  const meta = statusMeta(quest.status);
  const badges = quest.status === "open" ? questBadges(quest, now) : [{ label: meta.label, tone: meta.tone }];
  const pendingCount = detail.offers.filter((o) => o.status === "pending").length;
  const canOffer = role === "visitor" && quest.status === "open";

  const slab = canOffer ? (
    <>
      <Button variant="secondary" onPress={() => setSheetOpen(true)}>
        {t("questDetail.ask")}
      </Button>
      <Button variant="primary" fullWidth onPress={() => setSheetOpen(true)}>
        {t("questDetail.takeQuest")}
      </Button>
    </>
  ) : undefined;

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
        <InfoRow label={t("questDetail.meta.duration")} value={formatDuration(quest.estimatedMinutes)} />
        <InfoRow label={t("questDetail.meta.when")} value={formatWhenAt(quest.scheduledFor, now)} />
        {quest.status === "open" ? (
          <InfoRow label={t("questDetail.meta.offersClose")} value={formatWhenAt(quest.expiresAt, now)} />
        ) : null}
      </Card>

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
        </Card>
      ) : poster ? (
        <Card padding="md">
          <UserChip
            name={poster.name}
            rating={poster.rating}
            questsCompleted={poster.questsCompleted}
            verified={poster.verified}
            meta={role === "doer" ? t("questDetail.doingThisQuest") : t("questDetail.postedThisQuest")}
          />
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
            sendOffer.mutate(
              { questId, doerId: session!.userId, amountMinor, note },
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
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.secondary,
  },
  infoValue: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  offerCount: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
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
