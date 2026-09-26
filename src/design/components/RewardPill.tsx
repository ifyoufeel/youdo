/* Ports ds-bundle.js's RewardPill (1313-1375) — promoted from QuestCard's
   private PricePill now that a second consumer (M2's quest detail header,
   which wants a bigger "lg" reward display than a feed card's inline
   pill) needs the same shape. `md` is byte-for-byte what PricePill
   already was; QuestCard now renders this instead of keeping its own
   copy. No `unit` suffix (the web version's hourly-rate label) — ADR-011
   settled on one fixed price per quest, so there's never a unit to show. */
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Icon, type IconName } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const AMOUNT_FONT = fontFamilyName(raw.font.display, raw.fontWeight.black);

export type RewardPillSize = "md" | "lg";

export interface RewardPillProps {
  amount: string;
  size?: RewardPillSize;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function RewardPill({ amount, size = "md", icon = "coins", style, testID }: RewardPillProps) {
  const lg = size === "lg";
  return (
    <View
      style={[
        styles.pill,
        { height: lg ? 44 : 32, paddingHorizontal: lg ? 16 : 11 },
        style,
      ]}
      testID={testID}
    >
      <Icon name={icon} size={lg ? 19 : 15} color={raw.color.ink["900"]} />
      <Text style={[styles.amount, { fontSize: lg ? raw.fontSize["2xl"] : raw.fontSize.lg }]}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: raw.color.coin["500"],
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    borderRadius: raw.radius.pill,
  },
  amount: {
    fontFamily: AMOUNT_FONT,
    fontVariant: ["tabular-nums"],
    letterSpacing: raw.letterSpacing.heading,
    color: raw.color.ink["900"],
  },
});
