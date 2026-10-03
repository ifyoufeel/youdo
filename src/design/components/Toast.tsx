/* Ports ds-bundle.js's Toast (2073-2127) — a presentational banner, not a
   toast queue/manager. A screen that needs a real toast stack (showing
   one, auto-dismissing it, queueing the next) builds that state itself
   and renders this component for the current message — same division of
   concerns as every other design-system primitive here. Wrapped in
   Sticker for the hard offset shadow the web version gives it
   (`var(--shadow-sticker)`) — cheap fidelity now that Sticker exists. */
import { Pressable, View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Sticker } from "./Sticker";
import { Icon, type IconName } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const MESSAGE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.medium);
const ACTION_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);

export type ToastTone = "neutral" | "success" | "money" | "danger";

const TONES: Record<ToastTone, { bg: string; fg: string; icon: IconName }> = {
  neutral: { bg: raw.color.ink["900"], fg: raw.color.paper["050"], icon: "info" },
  success: { bg: raw.color.ink["900"], fg: raw.color.paper["050"], icon: "check-circle" },
  money: { bg: raw.color.coin["500"], fg: raw.color.ink["900"], icon: "coins" },
  danger: { bg: raw.color.ink["900"], fg: raw.color.paper["050"], icon: "alert-triangle" },
};

export interface ToastProps {
  children: string;
  tone?: ToastTone;
  icon?: IconName;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Toast({ children, tone = "neutral", icon, action, onAction, style, testID }: ToastProps) {
  const t = TONES[tone];
  return (
    <Sticker
      radius={raw.radius.md}
      color={semantic.shadow.sticker.color}
      interactive={false}
      style={style}
      testID={testID}
    >
      <View style={[styles.toast, { backgroundColor: t.bg }]} accessibilityRole="alert">
        <Icon name={icon ?? t.icon} size={18} strokeWidth={2} color={t.fg} />
        <Text style={[styles.message, { color: t.fg }]}>{children}</Text>
        {action ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <Text style={[styles.action, { color: t.fg }]}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
    </Sticker>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    borderRadius: raw.radius.md,
  },
  message: {
    flex: 1,
    minWidth: 0,
    fontFamily: MESSAGE_FONT,
    fontSize: raw.fontSize.sm,
  },
  action: {
    fontFamily: ACTION_FONT,
    fontSize: raw.fontSize.sm,
    textDecorationLine: "underline",
  },
});
