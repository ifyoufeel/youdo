/* Ports ds-bundle.js's QuestCard (1708-1946) — the "feed"/"compact"
   default layout and the "spacious"/"spacious-meta" alternate layout
   BrowseScreen actually uses (others' quests vs the viewer's own).

   Deliberately presentational only: `payout`/`distance`/`duration`/`when`
   arrive as already-formatted strings, not a Money value or a Date — the
   one formatting boundary stays formatMoney() at the call site (ADR-005),
   not duplicated in here.

   The card's badge/price/poster pieces used to be small helpers private
   to this file (M1) — promoted to public src/design/{Badge,RewardPill,
   UserChip}.tsx now that a second consumer (M2's quest detail/trust
   panel) needs their full surface. QuestCard renders those directly
   below rather than keeping a second, divergent copy. */
import { Pressable, View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Card } from "./Card";
import { Icon, type IconName } from "./Icon";
import { Badge, type BadgeTone } from "./Badge";
import { RewardPill } from "./RewardPill";
import { UserChip } from "./UserChip";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const TITLE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const META_FONT = fontFamilyName(raw.font.text, raw.fontWeight.medium);

export type QuestCardVariant = "feed" | "compact" | "spacious" | "spacious-meta";
export type QuestCardBadgeTone = BadgeTone;

export interface QuestCardBadge {
  label: string;
  tone?: QuestCardBadgeTone;
  icon?: IconName;
}

export interface QuestCardPoster {
  name: string;
  rating?: number;
  questsCompleted?: number;
  verified?: boolean;
}

export interface QuestCardProps {
  title: string;
  payout: string;
  distance?: string;
  duration?: string;
  when?: string;
  category?: string;
  poster?: QuestCardPoster;
  badges?: QuestCardBadge[];
  saved?: boolean;
  onSave?: () => void;
  variant?: QuestCardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function Meta({ icon, children }: { icon: IconName; children: string }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={13} strokeWidth={2} color={semantic.color.text.secondary} />
      <Text style={styles.metaText}>{children}</Text>
    </View>
  );
}

function SaveButton({ saved, onSave, size = 19 }: { saved: boolean; onSave: () => void; size?: number }) {
  return (
    <Pressable
      onPress={onSave}
      accessibilityRole="button"
      accessibilityLabel="Save quest"
      accessibilityState={{ selected: saved }}
      hitSlop={8}
      style={styles.saveButton}
    >
      <Icon name="heart" size={size} filled={saved} strokeWidth={2} color={saved ? raw.color.flare["500"] : raw.color.ink["300"]} />
    </Pressable>
  );
}

function TitleText({ children, size }: { children: string; size: number }) {
  return (
    <Text style={[styles.title, { fontSize: size, lineHeight: size * raw.lineHeight.snug }]} numberOfLines={2}>
      {children}
    </Text>
  );
}

function MetaRow({ distance, duration, when }: { distance?: string; duration?: string; when?: string }) {
  return (
    <View style={styles.metaRow}>
      {distance ? <Meta icon="map-pin">{distance}</Meta> : null}
      {duration ? <Meta icon="clock">{duration}</Meta> : null}
      {when ? <Meta icon="calendar">{when}</Meta> : null}
    </View>
  );
}

export function QuestCard({
  title,
  payout,
  distance,
  duration,
  when,
  category,
  poster,
  badges = [],
  saved = false,
  onSave,
  variant = "feed",
  onPress,
  style,
  testID,
}: QuestCardProps) {
  const compact = variant === "compact";
  const spacious = variant === "spacious" || variant === "spacious-meta";
  const spaciousMeta = variant === "spacious-meta";

  if (spacious) {
    return (
      <Card variant="sticker" padding="sm" interactive={!!onPress} onPress={onPress} style={style} testID={testID}>
        <View style={styles.spaciousColumn}>
          <View style={styles.spaciousTopRow}>
            {badges[0] ? <Badge {...badges[0]} /> : <View />}
            {onSave ? <SaveButton saved={saved} onSave={onSave} size={16} /> : null}
          </View>
          <TitleText size={raw.fontSize.lg}>{title}</TitleText>
          <MetaRow distance={distance} duration={duration} when={when} />
          <View style={styles.spaciousBottomRow}>
            {spaciousMeta ? (
              category ? (
                <Badge label={category} tone="neutral" />
              ) : when ? (
                <Meta icon="calendar">{when}</Meta>
              ) : (
                <View />
              )
            ) : poster ? (
              <UserChip name={poster.name} rating={poster.rating} questsCompleted={poster.questsCompleted} verified={poster.verified} size="sm" />
            ) : category ? (
              <Badge label={category} tone="neutral" />
            ) : (
              <View />
            )}
            <RewardPill amount={payout} />
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="sticker" padding={compact ? "sm" : "md"} interactive={!!onPress} onPress={onPress} style={style} testID={testID}>
      <View style={styles.row}>
        <View style={styles.mainColumn}>
          {badges.length ? (
            <View style={styles.badgeRow}>
              {badges.map((b) => (
                <Badge key={b.label} {...b} />
              ))}
            </View>
          ) : null}
          <TitleText size={compact ? raw.fontSize.md : raw.fontSize.lg}>{title}</TitleText>
          <MetaRow distance={distance} duration={duration} when={when} />
        </View>
        <View style={styles.priceColumn}>
          <RewardPill amount={payout} />
          {onSave ? <SaveButton saved={saved} onSave={onSave} /> : null}
        </View>
      </View>
      {category || poster ? (
        <View style={styles.footerRow}>
          {poster ? (
            <UserChip name={poster.name} rating={poster.rating} questsCompleted={poster.questsCompleted} verified={poster.verified} size="sm" />
          ) : category ? (
            <Badge label={category} tone="neutral" />
          ) : (
            <View />
          )}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  priceColumn: {
    alignItems: "flex-end",
    gap: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  title: {
    fontFamily: TITLE_FONT,
    letterSpacing: raw.letterSpacing.heading,
    color: semantic.color.text.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: META_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  saveButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: raw.border.hair,
    borderTopColor: semantic.color.border.subtle,
  },
  spaciousColumn: {
    gap: 4,
  },
  spaciousTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  spaciousBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 8,
    borderTopWidth: raw.border.hair,
    borderTopColor: semantic.color.border.subtle,
  },
});
