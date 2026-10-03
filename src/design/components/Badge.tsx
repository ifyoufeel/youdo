/* Ports ds-bundle.js's Badge (232-269) — promoted from QuestCard's
   private BadgePill now that a second consumer (M2's quest detail
   header/trust panel) needs the same tone system. QuestCard itself now
   renders this instead of keeping its own copy. */
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Icon, type IconName } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);

export type BadgeTone = "neutral" | "accent" | "money" | "hot" | "success" | "warning" | "danger" | "info" | "ink";
export type BadgeSize = "sm" | "md";

const TONES: Record<BadgeTone, { bg: string; fg: string }> = {
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

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Badge({ label, tone = "neutral", icon, size = "sm", style, testID }: BadgeProps) {
  const t = TONES[tone];
  const sm = size === "sm";
  return (
    <View
      style={[styles.badge, { height: sm ? 20 : 24, paddingHorizontal: sm ? 7 : 9, backgroundColor: t.bg }, style]}
      testID={testID}
    >
      {icon ? <Icon name={icon} size={sm ? 11 : 13} strokeWidth={2.25} color={t.fg} /> : null}
      <Text style={[styles.label, { fontSize: sm ? raw.fontSize["3xs"] : raw.fontSize["2xs"], color: t.fg }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: raw.radius.pill,
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.strong,
  },
  label: {
    fontFamily: LABEL_FONT,
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
  },
});
