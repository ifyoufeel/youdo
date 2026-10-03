/* Ports app.js's ThreadScreen (3094-3208). Screen(scroll=false) for the
   outer container (the message list gets its own ScrollView, the
   composer/closed-banner pin below it) — a plain ScrollView, not
   FlashList: fixture thread lengths are 1-4 messages (t-q1-u0's 4 is the
   longest), virtualizing that is the same kind of unneeded complexity M3
   avoided with curated Select lists over bespoke pickers. */
import { useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@design/components/Screen";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { EmptyState } from "@design/components/EmptyState";
import { Card } from "@design/components/Card";
import { Badge } from "@design/components/Badge";
import { RewardPill } from "@design/components/RewardPill";
import { Avatar } from "@design/components/Avatar";
import { StatusTrack } from "@design/components/StatusTrack";
import { IconButton } from "@design/components/IconButton";
import { Icon } from "@design/components/Icon";
import { money, formatMoney, type Message } from "@data/contracts";
import { statusMeta } from "@data/domain/lifecycle";
import { formatStamp } from "@lib/format";
import { useAuthSession } from "@data/auth-session";
import { useNow } from "@data/composition-root";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { useThread } from "./useThread";
import { useSendMessage } from "./useSendMessage";
import { Composer } from "./Composer";

const BUBBLE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const STAMP_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);
const ADDRESS_LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const ADDRESS_LINE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const CLOSED_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface ThreadScreenProps {
  threadId: string;
}

export function ThreadScreen({ threadId }: ThreadScreenProps) {
  const router = useRouter();
  const { session } = useAuthSession();
  const thread = useThread(threadId);
  const sendMessage = useSendMessage(threadId);
  const now = useNow();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [thread.messages.length, threadId]);

  if (thread.isLoading) {
    return (
      <Screen title={t("tabs.chats")} onBack={() => router.back()}>
        <LoadingState />
      </Screen>
    );
  }
  if (thread.isError) {
    return (
      <Screen onBack={() => router.back()}>
        <ErrorState />
      </Screen>
    );
  }
  if (!thread.thread) {
    return (
      <Screen onBack={() => router.back()}>
        <EmptyState title={t("offerInbox.questGone")} />
      </Screen>
    );
  }

  const { quest, other, messages, offer, closed } = thread;
  const meta = quest ? statusMeta(quest.status) : null;
  const amountMinor = offer ? offer.amountMinor : (quest?.payoutMinor ?? 0);
  const myUserId = session?.userId;

  return (
    <Screen
      title={other?.name ?? ""}
      subtitle={quest?.title}
      onBack={() => router.back()}
      scroll={false}
      topBarActions={
        quest ? (
          <IconButton
            icon="chevron-right"
            accessibilityLabel={t("thread.openQuest")}
            size="sm"
            onPress={() => router.push(`/quest/${quest.id}`)}
          />
        ) : undefined
      }
    >
      <View style={styles.flex}>
        {quest ? (
          <View style={styles.headerRow}>
            {meta && meta.track >= 0 ? (
              <StatusTrack current={meta.track} style={styles.statusTrack} />
            ) : (
              <View style={styles.statusBadgeWrap}>
                <Badge label={meta?.label ?? ""} tone={meta?.tone ?? "neutral"} />
              </View>
            )}
            <RewardPill amount={formatMoney(money(amountMinor))} />
          </View>
        ) : null}

        <ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={styles.messages}>
          {thread.addressVisible && quest && quest.status !== "open" ? (
            <Card variant="accent" padding="sm">
              <View style={styles.addressRow}>
                <Icon name="map-pin" size={16} strokeWidth={2} style={styles.addressIcon} />
                <View style={styles.addressTextColumn}>
                  <Text style={styles.addressLabel}>{t("thread.exactAddress")}</Text>
                  <Text style={styles.addressLine}>{quest.addressLine}</Text>
                </View>
              </View>
            </Card>
          ) : null}

          {messages.map((m: Message) => {
            const mine = m.senderId === myUserId;
            return (
              <View key={m.id} style={[styles.bubbleRow, { justifyContent: mine ? "flex-end" : "flex-start" }]}>
                {!mine && other ? <Avatar name={other.name} photoUrl={other.avatarUrl} size="sm" /> : null}
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={styles.bubbleText}>{m.body}</Text>
                  <Text style={styles.bubbleStamp}>{formatStamp(m.at, now)}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {closed ? (
          <View style={styles.closedBanner}>
            <Icon name="lock" size={15} color={raw.color.ink["500"]} />
            <Text style={styles.closedText}>
              {t("thread.closedBanner", { status: meta?.label.toLowerCase() ?? "" })}
            </Text>
          </View>
        ) : (
          <Composer onSend={(body) => sendMessage.mutate(body)} sending={sendMessage.isPending} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: raw.layout.gutterScreen,
    paddingVertical: 10,
    borderBottomWidth: raw.border.hair,
    borderBottomColor: semantic.color.border.subtle,
  },
  statusTrack: {
    flex: 1,
  },
  statusBadgeWrap: {
    flex: 1,
  },
  messages: {
    padding: raw.layout.gutterScreen,
    gap: 10,
  },
  addressRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  addressIcon: {
    marginTop: 2,
  },
  addressTextColumn: {
    flex: 1,
    minWidth: 0,
  },
  addressLabel: {
    fontFamily: ADDRESS_LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    color: raw.color.ink["900"],
  },
  addressLine: {
    marginTop: 2,
    fontFamily: ADDRESS_LINE_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  bubbleRow: {
    flexDirection: "row",
    gap: 8,
  },
  bubble: {
    maxWidth: "76%",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
  },
  bubbleMine: {
    backgroundColor: raw.color.lime["500"],
    borderRadius: 18,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: raw.color.paper["000"],
    borderRadius: 18,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontFamily: BUBBLE_FONT,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: raw.color.ink["900"],
  },
  bubbleStamp: {
    marginTop: 3,
    fontFamily: STAMP_FONT,
    fontSize: 10,
    opacity: 0.55,
    textAlign: "right",
    color: raw.color.ink["900"],
  },
  closedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: raw.layout.gutterScreen,
    paddingVertical: 12,
    backgroundColor: semantic.color.surface.sunken,
    borderTopWidth: raw.border.width,
    borderTopColor: semantic.color.border.strong,
  },
  closedText: {
    flex: 1,
    fontFamily: CLOSED_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
});
