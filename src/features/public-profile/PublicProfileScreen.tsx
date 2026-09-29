/* Ports preview/app.js's PublicProfileScreen (3666-3746) — identity,
   trust badges, open quests, and "What people said" (reveal-gated
   server-side, see usePublicProfile/ReviewsPort). Report and block are
   both real now (ReportSheet.tsx's own header comment). One deliberate
   simplification: open-quest cards omit `distance` — the prototype's
   `app.distanceTo(x)` reads a single global viewer position for free;
   here that would mean fetching the viewer's own User just for this one
   field, on a stranger's profile screen, for a number nothing else on
   this screen needs. */
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useNow } from "@data/composition-root";
import { Screen } from "@design/components/Screen";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { EmptyState } from "@design/components/EmptyState";
import { Card } from "@design/components/Card";
import { Avatar } from "@design/components/Avatar";
import { Badge } from "@design/components/Badge";
import { IconButton } from "@design/components/IconButton";
import { QuestCard } from "@design/components/QuestCard";
import { Toast } from "@design/components/Toast";
import { money, formatMoney } from "@data/contracts";
import { questDuration, formatWhenAt, formatStamp } from "@lib/format";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { usePublicProfile } from "./usePublicProfile";
import { useReportUser } from "./useReportUser";
import { useBlockUser } from "./useBlockUser";
import { ReportSheet } from "./ReportSheet";
import { ReviewCard } from "@features/reviews/ReviewCard";

const NAME_FONT = fontFamilyName(raw.font.display, raw.fontWeight.black);
const META_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const BIO_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const EYEBROW_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);

export interface PublicProfileScreenProps {
  userId: string;
}

export function PublicProfileScreen({ userId }: PublicProfileScreenProps) {
  const router = useRouter();
  const now = useNow();
  const profile = usePublicProfile(userId);
  const reportUser = useReportUser();
  const blockUser = useBlockUser();
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  if (profile.isLoading) {
    return (
      <Screen onBack={() => router.back()}>
        <LoadingState />
      </Screen>
    );
  }
  if (profile.isError) {
    return (
      <Screen onBack={() => router.back()}>
        <ErrorState onRetry={profile.refetch} />
      </Screen>
    );
  }
  if (!profile.user) {
    return (
      <Screen onBack={() => router.back()}>
        <EmptyState title="This profile no longer exists" />
      </Screen>
    );
  }

  const { user } = profile;

  return (
    <Screen
      title={user.name}
      onBack={() => router.back()}
      topBarActions={
        profile.viewerId && profile.viewerId !== user.id ? (
          <IconButton
            icon="flag"
            accessibilityLabel={t("publicProfile.reportAction")}
            size="sm"
            onPress={() => setReportSheetOpen(true)}
            testID="report-action"
          />
        ) : undefined
      }
    >
      {confirmation ? (
        <Toast tone="success" style={styles.confirmationToast}>
          {confirmation}
        </Toast>
      ) : null}

      <Card padding="lg">
        <View style={styles.headerRow}>
          <Avatar name={user.name} size="lg" verified={user.verified} />
          <View style={styles.identity}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.meta}>
              {t("publicProfile.joined", { area: user.area, when: formatStamp(user.joined, now) })}
            </Text>
          </View>
        </View>
        {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        <View style={styles.badgeRow}>
          {user.verified ? <Badge label={t("questDetail.verifiedBadge")} tone="success" icon="shield-check" size="sm" /> : null}
          <Badge label={user.rating.toFixed(1)} tone="money" icon="star" size="sm" />
          <Badge label={`${user.questsCompleted} quests`} size="sm" />
          <Badge label={t("questDetail.cancelRate", { pct: Math.round(user.cancelRate * 100) })} size="sm" />
        </View>
      </Card>

      {profile.openQuests.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>{t("publicProfile.openQuests")}</Text>
          {profile.openQuests.map((q) => (
            <QuestCard
              key={q.id}
              variant="compact"
              title={q.title}
              payout={formatMoney(money(q.payoutMinor))}
              duration={questDuration(q)}
              when={formatWhenAt(q.scheduledFor, now)}
              onPress={() => router.push(`/quest/${q.id}`)}
            />
          ))}
        </>
      ) : null}

      <Text style={styles.sectionLabel}>{t("publicProfile.whatPeopleSaid")}</Text>
      {profile.visibleReviews.length === 0 ? (
        <Card variant="sunken" padding="md">
          <Text style={styles.noRatings}>{t("publicProfile.noRatings")}</Text>
        </Card>
      ) : (
        profile.visibleReviews.map((r) => (
          <ReviewCard key={r.id} review={r} raterName={profile.raters.get(r.raterId)?.name} />
        ))
      )}

      {profile.viewerId && profile.viewerId !== user.id ? (
        <ReportSheet
          open={reportSheetOpen}
          onClose={() => setReportSheetOpen(false)}
          name={user.name}
          submitting={reportUser.isPending}
          blocking={blockUser.isPending}
          onReport={(reason) => {
            reportUser.mutate(
              { reporterId: profile.viewerId as string, targetUserId: user.id, reason },
              {
                onSuccess: () => {
                  setReportSheetOpen(false);
                  setConfirmation(t("reportSheet.reportedToast"));
                },
              }
            );
          }}
          onBlock={() => {
            blockUser.mutate(
              { userId: profile.viewerId as string, blockedId: user.id },
              {
                onSuccess: () => {
                  setReportSheetOpen(false);
                  setConfirmation(t("reportSheet.blockedToast"));
                },
              }
            );
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  identity: {
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
    marginTop: 2,
  },
  bio: {
    fontFamily: BIO_FONT,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: raw.color.ink["700"],
    marginTop: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: raw.border.hair,
    borderTopColor: semantic.color.border.default,
  },
  sectionLabel: {
    fontFamily: EYEBROW_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.secondary,
    marginTop: 4,
  },
  noRatings: {
    fontFamily: BIO_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.secondary,
  },
  confirmationToast: {
    marginBottom: 8,
  },
});
