/* Ports app.js's ChatsScreen (3210-3269), including the bell/notifications
   action (M4 Phase 6). */
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@design/components/Screen";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { EmptyState } from "@design/components/EmptyState";
import { Card } from "@design/components/Card";
import { UserChip } from "@design/components/UserChip";
import { Badge } from "@design/components/Badge";
import { IconButton } from "@design/components/IconButton";
import { statusMeta } from "@data/domain/lifecycle";
import { formatStamp } from "@lib/format";
import { useAuthSession } from "@data/auth-session";
import { useNow } from "@data/composition-root";
import { useUnreadNotificationCount } from "@features/notifications/useNotifications";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { useThreads, type ChatThreadSummary } from "./useThreads";

const STAMP_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);
const QUEST_TITLE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const PREVIEW_FONT_REGULAR = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const PREVIEW_FONT_BOLD = fontFamilyName(raw.font.text, raw.fontWeight.semibold);

export function ChatsScreen() {
  const router = useRouter();
  const threads = useThreads();
  const { session } = useAuthSession();
  const unreadNotifications = useUnreadNotificationCount();
  const now = useNow();

  if (threads.isLoading) {
    return (
      <Screen title={t("tabs.chats")}>
        <LoadingState />
      </Screen>
    );
  }
  if (threads.isError) {
    return (
      <Screen title={t("tabs.chats")}>
        <ErrorState onRetry={threads.refetch} />
      </Screen>
    );
  }

  return (
    <Screen
      title={t("tabs.chats")}
      topBarActions={
        <IconButton
          icon="bell"
          accessibilityLabel={t("notifications.title")}
          size="sm"
          badge={unreadNotifications || undefined}
          onPress={() => router.push("/notifications")}
        />
      }
    >
      {threads.summaries.length === 0 ? (
        <EmptyState title={t("chats.empty")} action={t("chats.browse")} onAction={() => router.push("/")} />
      ) : (
        threads.summaries.map((summary) => (
          <ThreadRow
            key={summary.thread.id}
            summary={summary}
            now={now}
            myUserId={session?.userId}
            onOpen={() => router.push(`/chats/${summary.thread.id}`)}
          />
        ))
      )}
    </Screen>
  );
}

function ThreadRow({
  summary,
  now,
  myUserId,
  onOpen,
}: {
  summary: ChatThreadSummary;
  now: number;
  myUserId: string | undefined;
  onOpen: () => void;
}) {
  const { other, quest, lastMessage, unreadCount, thread } = summary;
  const preview = lastMessage
    ? (lastMessage.senderId === myUserId ? t("chats.youPrefix") : "") + lastMessage.body
    : t("chats.noMessagesYet");

  return (
    <Card padding="sm" interactive onPress={onOpen} testID={`thread-row-${thread.id}`}>
      <View style={styles.headerRow}>
        {other ? (
          <UserChip name={other.name} rating={other.rating} questsCompleted={other.questsCompleted} verified={other.verified} style={styles.userChip} />
        ) : (
          <View style={styles.userChip} />
        )}
        <View style={styles.stampColumn}>
          <Text style={styles.stamp}>{formatStamp(thread.lastMessageAt, now)}</Text>
          {unreadCount > 0 ? <Badge label={t("chats.unread", { count: unreadCount })} tone="hot" size="sm" /> : null}
        </View>
      </View>
      <View style={styles.questRow}>
        <Text style={styles.questTitle} numberOfLines={1}>
          {quest?.title ?? t("chats.questRemoved")}
        </Text>
        {quest ? <Badge label={statusMeta(quest.status).label} tone={statusMeta(quest.status).tone} size="sm" /> : null}
      </View>
      <Text style={[styles.preview, unreadCount > 0 ? styles.previewUnread : null]} numberOfLines={1}>
        {preview}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userChip: {
    flex: 1,
    minWidth: 0,
  },
  stampColumn: {
    alignItems: "flex-end",
    gap: 4,
  },
  stamp: {
    fontFamily: STAMP_FONT,
    fontSize: raw.fontSize["3xs"],
    color: raw.color.ink["400"],
  },
  questRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: raw.border.hair,
    borderTopColor: semantic.color.border.subtle,
  },
  questTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: QUEST_TITLE_FONT,
    fontSize: raw.fontSize.xs,
    color: semantic.color.text.muted,
  },
  preview: {
    marginTop: 3,
    fontFamily: PREVIEW_FONT_REGULAR,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  previewUnread: {
    fontFamily: PREVIEW_FONT_BOLD,
  },
});
