/* Ports ds-bundle.js's UserChip (1508-1576) composed with Avatar
   (113-187) — promoted from QuestCard's private PosterRow now that a
   second consumer (M2's quest detail trust panel) needs the full
   surface, including the verified badge PosterRow never rendered even
   though QuestCardPoster.verified has existed since M1. Avatar itself
   stays folded in here rather than becoming its own public primitive —
   nothing else needs a bare avatar yet, same "build it when a second
   consumer needs it" call this file itself is the result of. No `src`/
   photo support — there's no image/asset pipeline yet, so this is always
   the initials-circle path. */
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const NAME_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const META_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const RATING_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const INITIALS_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);

export type UserChipSize = "sm" | "md" | "lg";

const AVATAR_SIZES: Record<UserChipSize, number> = { sm: 32, md: 40, lg: 56 };
const TINTS = [raw.color.lime["300"], raw.color.coin["300"], raw.color.flare["300"], raw.color.info["200"], raw.color.success["200"]];

function initialsFor(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function tintFor(name: string): string {
  return TINTS[(name.charCodeAt(0) || 0) % TINTS.length];
}

function Avatar({ name, size, verified }: { name: string; size: UserChipSize; verified: boolean }) {
  const d = AVATAR_SIZES[size];
  const badgeSize = Math.max(14, Math.round(d * 0.34));
  return (
    <View style={{ width: d, height: d }}>
      <View
        style={[
          styles.avatarCircle,
          { width: d, height: d, borderRadius: raw.radius.avatar, backgroundColor: tintFor(name) },
        ]}
      >
        <Text style={[styles.initials, { fontSize: Math.round(d * 0.38) }]}>{initialsFor(name)}</Text>
      </View>
      {verified ? (
        <View
          style={[
            styles.verifiedBadge,
            { width: badgeSize, height: badgeSize, borderRadius: raw.radius.pill },
          ]}
        >
          <Icon name="check" size={Math.max(8, Math.round(d * 0.2))} strokeWidth={2.25} color={raw.color.ink["900"]} />
        </View>
      ) : null}
    </View>
  );
}

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
  avatarCircle: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    overflow: "hidden",
  },
  initials: {
    fontFamily: INITIALS_FONT,
    letterSpacing: -0.02,
    color: raw.color.ink["900"],
  },
  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: raw.color.lime["500"],
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
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
