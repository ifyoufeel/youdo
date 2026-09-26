/* Ports ds-bundle.js's QuestCard (1708-1946) — the "feed"/"compact"
   default layout and the "spacious"/"spacious-meta" alternate layout
   BrowseScreen actually uses (others' quests vs the viewer's own).

   Deliberately presentational only: `payout`/`distance`/`duration`/`when`
   arrive as already-formatted strings, not a Money value or a Date — the
   one formatting boundary stays formatMoney() at the call site (ADR-005),
   not duplicated in here.

   The card's badge pill, price pill, and poster row are small helpers
   private to this file — not exported, no variant matrix — rather than
   formalizing Badge/RewardPill/UserChip as public src/design primitives.
   Nothing else needs their full surface yet; they get built for real once
   a second screen does (M2's detail/trust panel, M6's profile), at which
   point these get swapped for the real components in a one-file change.
   Also skipped here: UserChip's Avatar circle — the poster row is name +
   rating + quest count as plain text, no avatar glyph, until Avatar
   itself is built. */
import { Pressable, View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Card } from "./Card";
import { Icon, type IconName } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const TITLE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const META_FONT = fontFamilyName(raw.font.text, raw.fontWeight.medium);
const BADGE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const PRICE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.black);
const POSTER_NAME_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const POSTER_META_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const CATEGORY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);

export type QuestCardVariant = "feed" | "compact" | "spacious" | "spacious-meta";
export type QuestCardBadgeTone = "neutral" | "accent" | "money" | "hot" | "success" | "warning" | "danger" | "info" | "ink";

const BADGE_TONES: Record<QuestCardBadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: raw.color.paper["200"], fg: raw.color.ink["800"] },
  accent: { bg: raw.color.lime["500"], fg: raw.color.ink["900"] },
  money: { bg: raw.color.coin["500"], fg: raw.color.ink["900"] },
  hot: { bg: raw.color.flare["500"], fg: raw.color.ink["900"] },
  success: { bg: raw.color.success["200"], fg: raw.color.success["600"] },
  warning: { bg: raw.color.warning["200"], fg: raw.color.warning["600"] },
  danger: { bg: raw.color.danger["200"], fg: raw.color.danger["600"] },
  info: { bg: raw.color.info["200"], fg: raw.color.info["600"] },
  ink: { bg: raw.color.ink["900"], fg: raw.color.paper["050"] },
};

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

function BadgePill({ label, tone = "neutral", icon, size = "sm" }: QuestCardBadge & { size?: "sm" | "md" }) {
  const t = BADGE_TONES[tone];
  const sm = size === "sm";
  return (
    <View style={[styles.badge, { height: sm ? 20 : 24, paddingHorizontal: sm ? 7 : 9, backgroundColor: t.bg }]}>
      {icon ? <Icon name={icon} size={sm ? 11 : 13} strokeWidth={2.25} color={t.fg} /> : null}
      <Text style={[styles.badgeLabel, { fontSize: sm ? raw.fontSize["3xs"] : raw.fontSize["2xs"], color: t.fg }]}>
        {label}
      </Text>
    </View>
  );
}

function Meta({ icon, children }: { icon: IconName; children: string }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={13} strokeWidth={2} color={semantic.color.text.secondary} />
      <Text style={styles.metaText}>{children}</Text>
    </View>
  );
}

function PricePill({ amount }: { amount: string }) {
  return (
    <View style={styles.pricePill}>
      <Icon name="coins" size={15} color={raw.color.ink["900"]} />
      <Text style={styles.priceText}>{amount}</Text>
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

function PosterRow({ poster }: { poster: QuestCardPoster }) {
  return (
    <View style={styles.posterRow}>
      <Text style={styles.posterName} numberOfLines={1}>
        {poster.name}
      </Text>
      {poster.questsCompleted !== undefined ? (
        <Text style={styles.posterMeta}>{poster.questsCompleted} quests</Text>
      ) : null}
      {poster.rating !== undefined ? (
        <View style={styles.posterRating}>
          <Icon name="star" size={12} filled color={raw.color.coin["500"]} />
          <Text style={styles.posterRatingText}>{poster.rating}</Text>
        </View>
      ) : null}
    </View>
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
            {badges[0] ? <BadgePill {...badges[0]} /> : <View />}
            {onSave ? <SaveButton saved={saved} onSave={onSave} size={16} /> : null}
          </View>
          <TitleText size={raw.fontSize.lg}>{title}</TitleText>
          <MetaRow distance={distance} duration={duration} when={when} />
          <View style={styles.spaciousBottomRow}>
            {spaciousMeta ? (
              category ? (
                <BadgePill label={category} tone="neutral" />
              ) : when ? (
                <Meta icon="calendar">{when}</Meta>
              ) : (
                <View />
              )
            ) : poster ? (
              <PosterRow poster={poster} />
            ) : category ? (
              <BadgePill label={category} tone="neutral" />
            ) : (
              <View />
            )}
            <PricePill amount={payout} />
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
                <BadgePill key={b.label} {...b} />
              ))}
            </View>
          ) : null}
          <TitleText size={compact ? raw.fontSize.md : raw.fontSize.lg}>{title}</TitleText>
          <MetaRow distance={distance} duration={duration} when={when} />
        </View>
        <View style={styles.priceColumn}>
          <PricePill amount={payout} />
          {onSave ? <SaveButton saved={saved} onSave={onSave} /> : null}
        </View>
      </View>
      {category || poster ? (
        <View style={styles.footerRow}>
          {poster ? <PosterRow poster={poster} /> : category ? <BadgePill label={category} tone="neutral" /> : <View />}
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: raw.radius.pill,
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.strong,
  },
  badgeLabel: {
    fontFamily: BADGE_FONT,
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
  },
  pricePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 32,
    paddingHorizontal: 11,
    backgroundColor: raw.color.coin["500"],
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    borderRadius: raw.radius.pill,
  },
  priceText: {
    fontFamily: PRICE_FONT,
    fontSize: raw.fontSize.sm,
    fontVariant: ["tabular-nums"],
    color: raw.color.ink["900"],
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
  posterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  posterName: {
    fontFamily: POSTER_NAME_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  posterMeta: {
    fontFamily: POSTER_META_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  posterRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  posterRatingText: {
    fontFamily: CATEGORY_FONT,
    fontSize: raw.fontSize["2xs"],
    color: raw.color.ink["800"],
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
