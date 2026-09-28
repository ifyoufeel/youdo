/* Ports app.js's NotificationsScreen (3611-3651). Every notification
   type — including "message" — opens the quest it's about, not the
   thread, matching the prototype exactly (app.js's own onOpen(n.questId)). */
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@design/components/Screen";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { EmptyState } from "@design/components/EmptyState";
import { Card } from "@design/components/Card";
import { Icon, type IconName } from "@design/components/Icon";
import type { NotificationType } from "@data/contracts";
import { formatStamp } from "@lib/format";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { useNotifications } from "./useNotifications";

const BODY_FONT_REGULAR = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const BODY_FONT_SEMIBOLD = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const STAMP_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

const NOTIFICATION_ICON: Record<NotificationType, IconName> = {
  offer_received: "user",
  offer_accepted: "check-circle",
  offer_declined: "x",
  message: "message-circle",
  quest_started: "zap",
  quest_done: "check",
  payment: "coins",
  quest_cancelled: "x",
  quest_expired: "clock",
  quest_disputed: "flag",
};

export function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotifications();
  const [now] = useState(() => Date.now());

  if (notifications.isLoading) {
    return (
      <Screen title={t("notifications.title")} onBack={() => router.back()}>
        <LoadingState />
      </Screen>
    );
  }
  if (notifications.isError) {
    return (
      <Screen title={t("notifications.title")} onBack={() => router.back()}>
        <ErrorState onRetry={notifications.refetch} />
      </Screen>
    );
  }

  return (
    <Screen title={t("notifications.title")} onBack={() => router.back()}>
      {notifications.notifications.length === 0 ? (
        <EmptyState title={t("notifications.empty")} action={t("notifications.browse")} onAction={() => router.push("/")} />
      ) : (
        notifications.notifications.map((n) => (
          <Card
            key={n.id}
            padding="sm"
            variant={n.readAt ? "flat" : "sticker"}
            interactive={!!n.questId}
            onPress={n.questId ? () => router.push(`/quest/${n.questId}`) : undefined}
            testID={`notification-${n.id}`}
          >
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: n.readAt ? semantic.color.surface.sunken : raw.color.lime["500"] }]}>
                <Icon name={NOTIFICATION_ICON[n.type] ?? "bell"} size={15} strokeWidth={2} />
              </View>
              <View style={styles.textColumn}>
                <Text style={[styles.body, n.readAt ? styles.bodyRead : styles.bodyUnread]}>{n.body}</Text>
                <Text style={styles.stamp}>{formatStamp(n.at, now)}</Text>
              </View>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: raw.radius.pill,
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
  },
  body: {
    fontFamily: BODY_FONT_REGULAR,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: semantic.color.text.primary,
  },
  bodyUnread: {
    fontFamily: BODY_FONT_SEMIBOLD,
  },
  bodyRead: {
    fontFamily: BODY_FONT_REGULAR,
  },
  stamp: {
    marginTop: 3,
    fontFamily: STAMP_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.muted,
  },
});
