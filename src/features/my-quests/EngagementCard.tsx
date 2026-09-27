/* Feature-local, not promoted — a single-consumer composition of already-
   public primitives (Card/Badge/RewardPill/UserChip/Button), same call as
   quest-detail's OfferSheet in M2. Ported from app.js:2959-3045
   (EngagementCard), including StatusTrack/ConfirmWindow (M4 Phase 2) at
   the same spots the source puts them. "Confirm and pay"/"Leave a
   rating" stay out until M5/M6 — still no dead buttons.

   One deliberate layout divergence: the source puts its one primary
   action inline in the footer row, next to the counterpart/fallback text,
   and makes the whole card clickable (stopping propagation on the
   action). M3 already chose an explicit "View" button over a
   whole-card-press affordance; keeping both "View" and a second inline
   action would crowd a narrow footer row. The primary action (Review
   offers / Start quest / Mark as done) instead renders as its own
   full-width button below the footer — one clear action per card, same
   information, no new gesture handling. */
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@design/components/Card";
import { Badge } from "@design/components/Badge";
import { RewardPill } from "@design/components/RewardPill";
import { UserChip } from "@design/components/UserChip";
import { Button, type ButtonVariant } from "@design/components/Button";
import { Icon, type IconName } from "@design/components/Icon";
import { StatusTrack } from "@design/components/StatusTrack";
import { ConfirmWindow } from "@design/components/ConfirmWindow";
import { money, formatMoney, type Quest, type User } from "@data/contracts";
import { statusMeta, type Role } from "@data/domain/lifecycle";
import { formatWhenAt, formatRemaining } from "@lib/format";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";

const TITLE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const WHEN_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const FALLBACK_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface EngagementCardProps {
  quest: Quest;
  role: Role;
  amountMinor: number;
  counterpart: User | null;
  pendingOfferCount: number;
  now: number;
  onOpen: () => void;
  /** Each stays optional and unwired until its real destination/mutation
      exists — MyQuestsScreen passes what it has; gallery specimens with
      nothing to call simply omit it, and no action button renders. */
  onReviewOffers?: () => void;
  onStartQuest?: () => void;
  onMarkAsDone?: () => void;
}

interface PrimaryAction {
  label: string;
  icon: IconName;
  variant: ButtonVariant;
  onPress: () => void;
  testID: string;
}

export function EngagementCard({
  quest,
  role,
  amountMinor,
  counterpart,
  pendingOfferCount,
  now,
  onOpen,
  onReviewOffers,
  onStartQuest,
  onMarkAsDone,
}: EngagementCardProps) {
  const meta = statusMeta(quest.status);
  const roleLabel =
    role === "poster" ? t("myQuests.role.poster") : role === "doer" ? t("myQuests.role.doer") : t("myQuests.role.applicant");

  const expiresFuture = Date.parse(quest.expiresAt) > now;
  const fallbackText = expiresFuture
    ? t("myQuests.offersCloseIn", { remaining: formatRemaining(quest.expiresAt, now) ?? "" })
    : pendingOfferCount > 0
      ? t("myQuests.offersClosed")
      : t("myQuests.noOffers");

  // Ported from app.js's own primary() — one action per card, chosen by
  // role and status, so this card and QuestDetailScreen's slab can never
  // disagree. Scoped to what's real: the poster+completed ("Confirm and
  // pay") and paid+unrated ("Leave a rating") branches stay out (M5/M6).
  let action: PrimaryAction | null = null;
  if (role === "poster" && quest.status === "open" && onReviewOffers) {
    action = {
      label:
        pendingOfferCount > 0
          ? t("myQuests.action.reviewOffersCount", { count: pendingOfferCount, noun: pendingOfferCount === 1 ? "offer" : "offers" })
          : t("myQuests.action.reviewOffers"),
      icon: "users",
      variant: pendingOfferCount > 0 ? "primary" : "secondary",
      onPress: onReviewOffers,
      testID: "engagement-review-offers",
    };
  } else if (role === "doer" && quest.status === "assigned" && onStartQuest) {
    action = { label: t("myQuests.action.startQuest"), icon: "zap", variant: "primary", onPress: onStartQuest, testID: "engagement-start-quest" };
  } else if (role === "doer" && quest.status === "in_progress" && onMarkAsDone) {
    action = { label: t("myQuests.action.markAsDone"), icon: "check", variant: "primary", onPress: onMarkAsDone, testID: "engagement-mark-as-done" };
  }

  return (
    <Card padding="md" testID="engagement-card">
      <View style={styles.badgeRow}>
        <Badge label={roleLabel} tone={role === "poster" ? "neutral" : "accent"} size="sm" />
        <Badge label={meta.label} tone={meta.tone} size="sm" />
      </View>
      <Text style={styles.title}>{quest.title}</Text>
      <View style={styles.metaRow}>
        <View style={styles.whenGroup}>
          <Icon name="calendar" size={13} strokeWidth={2} color={raw.color.ink["500"]} />
          <Text style={styles.when}>{formatWhenAt(quest.scheduledFor, now)}</Text>
        </View>
        <RewardPill amount={formatMoney(money(amountMinor))} />
      </View>

      {meta.track >= 0 ? <StatusTrack current={meta.track} style={styles.statusTrack} /> : null}
      {quest.status === "completed" ? (
        <ConfirmWindow quest={quest} now={now} doerSide={role === "doer"} style={styles.confirmWindow} />
      ) : null}

      <View style={styles.footer}>
        {counterpart ? (
          <UserChip
            name={counterpart.name}
            rating={counterpart.rating}
            questsCompleted={counterpart.questsCompleted}
            verified={counterpart.verified}
            size="sm"
            style={styles.counterpart}
          />
        ) : (
          <Text style={styles.fallback}>{fallbackText}</Text>
        )}
        <Button size="sm" variant="secondary" onPress={onOpen} testID="engagement-view">
          {t("myQuests.view")}
        </Button>
      </View>
      {action ? (
        <Button
          size="sm"
          variant={action.variant}
          icon={action.icon}
          fullWidth
          style={styles.actionButton}
          onPress={action.onPress}
          testID={action.testID}
        >
          {action.label}
        </Button>
      ) : null}
    </Card>
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
    fontSize: raw.fontSize.md,
    letterSpacing: raw.letterSpacing.heading,
    color: semantic.color.text.primary,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  whenGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  when: {
    fontFamily: WHEN_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: raw.border.hair,
    borderTopColor: semantic.color.border.default,
  },
  counterpart: {
    flex: 1,
    minWidth: 0,
  },
  fallback: {
    flex: 1,
    minWidth: 0,
    fontFamily: FALLBACK_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  statusTrack: {
    marginTop: 12,
  },
  confirmWindow: {
    marginTop: 10,
  },
  actionButton: {
    marginTop: 8,
  },
});
