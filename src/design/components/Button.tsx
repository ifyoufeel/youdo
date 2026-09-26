/* Ports ds-bundle.js's Button (272-411) — VARIANTS/SIZES as typed
   StyleSheet objects, the press/hover shadow-and-translate behavior
   delegated to <Sticker> (ADR-003) instead of Button computing its own
   boxShadow/transform inline the way the web version does.

   SIZES' 14px/20px/26px horizontal padding and 6/8/10px icon gaps are
   ported as literal numbers, matching the web source exactly — they were
   never spacing-scale tokens there either, just component-local choices
   (ds-bundle.js:319-341). Height genuinely is a token (raw.layout.
   controlHeight{Sm,Md,Lg}) and font size genuinely is one
   (raw.fontSize.{sm,md,lg}) — those two are read from tokens, not
   hardcoded, matching which SIZES fields the web version sources from
   var(...) versus which it writes as literal px. */
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Sticker } from "./Sticker";
import { Icon, type IconName } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

export type ButtonVariant = "primary" | "secondary" | "inverse" | "money" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface VariantStyle {
  bg: string;
  bgHover: string;
  fg: string;
  border: string;
  /** null = ghost's no-shadow variant; Sticker is skipped entirely rather
      than faked with a shadow-less press motion (see Card.tsx's identical
      call for the same reasoning). */
  shadowColor: string | null;
}

const VARIANTS: Record<ButtonVariant, VariantStyle> = {
  primary: {
    bg: semantic.color.action.primary.bg,
    bgHover: semantic.color.action.primary.bgHover,
    fg: semantic.color.action.primary.fg,
    border: semantic.color.border.strong,
    shadowColor: semantic.shadow.sticker.color,
  },
  secondary: {
    bg: semantic.color.action.secondary.bg,
    bgHover: semantic.color.action.secondary.bgHover,
    fg: semantic.color.action.secondary.fg,
    border: semantic.color.border.strong,
    shadowColor: semantic.shadow.sticker.color,
  },
  inverse: {
    bg: semantic.color.action.inverse.bg,
    bgHover: semantic.color.action.inverse.bgHover,
    fg: semantic.color.action.inverse.fg,
    border: semantic.color.border.strong,
    shadowColor: semantic.shadow.sticker.color,
  },
  money: {
    bg: semantic.color.surface.money,
    bgHover: raw.color.coin["600"],
    fg: raw.color.ink["900"],
    border: semantic.color.border.strong,
    shadowColor: semantic.shadow.sticker.color,
  },
  danger: {
    bg: semantic.color.action.danger.bg,
    bgHover: raw.color.danger["600"],
    fg: semantic.color.action.danger.fg,
    border: semantic.color.border.strong,
    shadowColor: semantic.shadow.sticker.color,
  },
  ghost: {
    bg: "transparent",
    bgHover: semantic.color.surface.sunken,
    fg: semantic.color.text.primary,
    border: "transparent",
    shadowColor: null,
  },
};

interface SizeStyle {
  height: number;
  paddingHorizontal: number;
  fontSize: number;
  gap: number;
  iconSize: number;
}

const SIZES: Record<ButtonSize, SizeStyle> = {
  sm: { height: raw.layout.controlHeightSm, paddingHorizontal: 14, fontSize: raw.fontSize.sm, gap: 6, iconSize: 16 },
  md: { height: raw.layout.controlHeightMd, paddingHorizontal: 20, fontSize: raw.fontSize.md, gap: 8, iconSize: 18 },
  lg: { height: raw.layout.controlHeightLg, paddingHorizontal: 26, fontSize: raw.fontSize.lg, gap: 10, iconSize: 20 },
};

const BUTTON_FONT_FAMILY = fontFamilyName(raw.font.text, raw.fontWeight.bold);

export interface ButtonProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  fullWidth = false,
  disabled = false,
  onPress,
  style,
  testID,
}: ButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const fg = disabled ? semantic.color.action.disabled.fg : v.fg;
  const border = disabled ? raw.color.ink["200"] : v.border;

  function label(bg: string) {
    return (
      <View
        style={[
          styles.base,
          {
            height: s.height,
            paddingHorizontal: s.paddingHorizontal,
            gap: s.gap,
            width: fullWidth ? "100%" : undefined,
            backgroundColor: bg,
            borderColor: border,
            borderWidth: raw.border.width,
            borderRadius: raw.radius.control,
          },
        ]}
      >
        {icon ? <Icon name={icon} size={s.iconSize} strokeWidth={2} color={fg} /> : null}
        <Text
          numberOfLines={1}
          style={{
            fontFamily: BUTTON_FONT_FAMILY,
            fontSize: s.fontSize,
            letterSpacing: -0.005 * s.fontSize,
            lineHeight: s.fontSize,
            color: fg,
          }}
        >
          {children}
        </Text>
        {iconRight ? <Icon name={iconRight} size={s.iconSize} strokeWidth={2} color={fg} /> : null}
      </View>
    );
  }

  if (!v.shadowColor || disabled) {
    // ghost never shadows; a disabled button of any variant loses its lift
    // too (ds-bundle.js:378's `lift = v.shadow && !disabled`). Still a real
    // Pressable — ghost still swaps to bgHover on hover, it just never
    // grows a shadow doing it.
    return (
      <UnshadowedButton
        disabled={disabled}
        bg={disabled ? semantic.color.action.disabled.bg : v.bg}
        bgHover={disabled ? semantic.color.action.disabled.bg : v.bgHover}
        onPress={onPress}
        style={[fullWidth ? styles.fullWidth : null, style]}
        testID={testID}
      >
        {label}
      </UnshadowedButton>
    );
  }

  return (
    <Sticker
      radius={raw.radius.control}
      color={v.shadowColor}
      interactive
      disabled={disabled}
      onPress={onPress}
      style={[fullWidth ? styles.fullWidth : null, style]}
      testID={testID}
    >
      {label(v.bg)}
    </Sticker>
  );
}

function UnshadowedButton({
  disabled,
  bg,
  bgHover,
  onPress,
  style,
  testID,
  children,
}: {
  disabled: boolean;
  bg: string;
  bgHover: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children: (bg: string) => ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={style}
    >
      {children(hovered ? bgHover : bg)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
});
