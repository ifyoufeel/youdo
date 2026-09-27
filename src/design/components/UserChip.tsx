/* Ports ds-bundle.js's UserChip (1508-1576), composed with Avatar
   (promoted to its own file, ./Avatar.tsx, in M4 — a second consumer,
   OfferRow's decided-offers list and ThreadScreen's message bubbles,
   needed a bare avatar with no name/rating/meta alongside it). */
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "./Icon";
import { Avatar, type AvatarSize } from "./Avatar";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const NAME_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const META_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const RATING_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);

export type UserChipSize = AvatarSize;

export interface UserChipProps {
  name: string;
  rating?: number;
  questsCompleted?: number;
  verified?: boolean;
  /** Extra trailing meta text — e.g. "Posted this quest" / "Doing this quest". */
  meta?: string;
  size?: UserChipSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function UserChip({
  name,
  rating,
  questsCompleted,
  verified = false,
  meta,
  size = "md",
  style,
  testID,
}: UserChipProps) {
  const lg = size === "lg";
  return (
    <View style={[styles.row, style]} testID={testID}>
      <Avatar name={name} size={size} verified={verified} />
      <View style={styles.textColumn}>
        <Text style={[styles.name, { fontSize: lg ? raw.fontSize.lg : raw.fontSize.sm }]} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.metaRow}>
          {questsCompleted !== undefined ? <Text style={styles.metaText}>{questsCompleted} quests</Text> : null}
          {rating !== undefined ? (
            <View style={styles.ratingRow}>
              <Icon name="star" size={12} filled color={raw.color.coin["500"]} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          ) : null}
          {meta ? <Text style={styles.metaText}>{meta}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
    flexShrink: 1,
  },
  textColumn: {
    gap: 2,
    minWidth: 0,
    flexShrink: 1,
  },
  name: {
    fontFamily: NAME_FONT,
    color: semantic.color.text.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: META_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontFamily: RATING_FONT,
    fontSize: raw.fontSize["2xs"],
    color: raw.color.ink["800"],
  },
});
