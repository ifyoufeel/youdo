/* Ports preview/app.js's RatingStar (1474-1487) — "the rating, as the
   profile wants it: a tilted gold star and the number, no label. Playful
   rather than a stat tile — the number is the whole point." Feature-
   local: it's shaped by PRD §7.8's trust display, not a general-purpose
   primitive UserChip's own inline star+number micro-version already
   covers the compact case. */
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "@design/components/Icon";
import { raw } from "@design/tokens/raw";
import { fontFamilyName } from "@design/tokens/font-family";

const VALUE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.black);

export interface RatingStarProps {
  value: number;
  size?: "md" | "lg";
}

export function RatingStar({ value, size = "md" }: RatingStarProps) {
  const lg = size === "lg";
  return (
    <View style={styles.row}>
      <View style={styles.starWrap}>
        <Icon name="star" size={lg ? 22 : 17} filled strokeWidth={2} color={raw.color.coin["500"]} />
      </View>
      <Text style={[styles.value, { fontSize: lg ? raw.fontSize.xl : raw.fontSize.md }]}>{value.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
  },
  starWrap: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-12deg" }],
  },
  value: {
    fontFamily: VALUE_FONT,
    letterSpacing: raw.letterSpacing.heading,
    fontVariant: ["tabular-nums"],
    color: raw.color.ink["900"],
  },
});
