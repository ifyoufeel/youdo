/* Feature-local, not promoted — a single-consumer composition of already-
   public primitives (Card/Badge/RewardPill/UserChip/Button), same call as
   quest-detail's OfferSheet in M2. Ported from app.js:2959-3045
   (EngagementCard). M4 adds the poster+open "Review offers" action
   (primary() 's first branch); "Start quest"/"Mark as done" land in M4
   Phase 4, "Confirm and pay"/"Leave a rating" stay out until M5/M6 —
   still no dead buttons, per this file's own original discipline. */
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@design/components/Card";
import { Badge } from "@design/components/Badge";
import { RewardPill } from "@design/components/RewardPill";
import { UserChip } from "@design/components/UserChip";
import { Button } from "@design/components/Button";
import { Icon } from "@design/components/Icon";
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
  /** Present only once a "Review offers" action is real to wire —
      MyQuestsScreen passes it; gallery specimens with nothing to
      navigate to simply omit it, and the button doesn't render. */
  onReviewOffers?: () => void;
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

  const showReviewOffers = role === "poster" && quest.status === "open" && !!onReviewOffers;

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
      {showReviewOffers ? (
        <Button
          size="sm"
          variant={pendingOfferCount > 0 ? "primary" : "secondary"}
          icon="users"
          fullWidth
          style={styles.reviewOffersButton}
          onPress={onReviewOffers}
          testID="engagement-review-offers"
        >
          {pendingOfferCount > 0
            ? t("myQuests.action.reviewOffersCount", { count: pendingOfferCount, noun: pendingOfferCount === 1 ? "offer" : "offers" })
            : t("myQuests.action.reviewOffers")}
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
  reviewOffersButton: {
    marginTop: 8,
  },
});
