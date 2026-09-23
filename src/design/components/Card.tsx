/* Ports ds-bundle.js's Card (1578-1682). Deliberately demonstrates
   ADR-003's overflow-clipping watch item, not just avoids it: the outer
   box (background/border/radius, and — when a `media` slot is given — a
   bottom-bordered, overflow:hidden wrapper around it, exactly like the
   web version) is Sticker's `children`, never Sticker's own wrapper — so
   the box's overflow:hidden clips its own content correctly while
   Sticker's shadow sibling, rendered outside that box, is structurally
   unclippable by it. */
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Sticker } from "./Sticker";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";

export type CardVariant = "sticker" | "flat" | "sunken" | "accent" | "money" | "inverse";
export type CardPadding = "none" | "sm" | "md" | "lg";

interface VariantStyle {
  bg: string;
  fg: string;
  border: string;
  borderWidth: number;
  /** null = flat/sunken's no-shadow variants. Card renders as a plain
      View for these, without <Sticker> at all — the web version still
      lets a "live" (clickable) flat/sunken card animate a press/hover
      translate with no shadow alongside it (ds-bundle.js:1649-1650 checks
      `live`, not `v.shadow`, for the transform); that reads as a bug
      more than a brand behavior worth reproducing, since this whole
      design system's press motion exists to sell the shadow-collapsing
      effect — motion with no shadow to collapse toward has nothing to
      say. Flat/sunken cards are static here, shadow and motion alike. */
  shadowColor: string | null;
}

const VARIANTS: Record<CardVariant, VariantStyle> = {
  sticker: {
    bg: semantic.color.surface.card,
    fg: semantic.color.text.primary,
    border: semantic.color.border.strong,
    borderWidth: raw.border.width,
    shadowColor: semantic.shadow.sticker.color,
  },
  flat: {
    bg: semantic.color.surface.card,
    fg: semantic.color.text.primary,
    border: semantic.color.border.default,
    borderWidth: raw.border.hair,
    shadowColor: null,
  },
  sunken: {
    bg: semantic.color.surface.sunken,
    fg: semantic.color.text.primary,
    border: "transparent",
    borderWidth: raw.border.width,
    shadowColor: null,
  },
  accent: {
    bg: semantic.color.surface.accent,
    fg: raw.color.ink["900"],
    border: semantic.color.border.strong,
    borderWidth: raw.border.width,
    shadowColor: semantic.shadow.sticker.color,
  },
  money: {
    bg: semantic.color.surface.money,
    fg: raw.color.ink["900"],
    border: semantic.color.border.strong,
    borderWidth: raw.border.width,
    shadowColor: semantic.shadow.sticker.color,
  },
  inverse: {
    bg: semantic.color.surface.inverse,
    fg: semantic.color.text.inverse,
    border: semantic.color.border.strong,
    borderWidth: raw.border.width,
    shadowColor: semantic.shadow.stickerLime.color, // the one variant whose shadow isn't ink
  },
};

const PADDING: Record<CardPadding, number> = {
  none: 0,
  sm: 12, // literal in the web source too (ds-bundle.js:1631) — not raw.layout.cardPadding
  md: 16, // == raw.layout.cardPadding, but written as a literal to match the web SIZES-style table exactly
  lg: 20, // == raw.layout.cardPaddingLg
};

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  media?: ReactNode;
  interactive?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Card({
  children,
  variant = "sticker",
  padding = "md",
  media,
  interactive = false,
  onPress,
  style,
  testID,
}: CardProps) {
  const v = VARIANTS[variant];
  const live = interactive || !!onPress;

  const box = (
    <View
      style={[
        styles.box,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: v.borderWidth,
          borderRadius: raw.radius.card,
        },
      ]}
    >
      {media ? (
        <View style={{ borderBottomWidth: v.borderWidth, borderBottomColor: v.border, overflow: "hidden" }}>
          {media}
        </View>
      ) : null}
      <View style={{ padding: PADDING[padding], gap: raw.layout.cardGap }}>{children}</View>
    </View>
  );

  if (!v.shadowColor) {
    // No shadow means no boxShadow/transform hover-or-press feedback in the
    // web version either (Card never gave flat/sunken a bgHover to fall
    // back on) — a plain Pressable with zero visual state change is
    // faithful here, not a simplification.
    return live ? (
      <Pressable style={style} testID={testID} onPress={onPress}>
        {box}
      </Pressable>
    ) : (
      <View style={style} testID={testID}>
        {box}
      </View>
    );
  }

  return (
    <Sticker
      radius={raw.radius.card}
      color={v.shadowColor}
      interactive={live}
      onPress={onPress}
      style={style}
      testID={testID}
    >
      {box}
    </Sticker>
  );
}

const styles = StyleSheet.create({
  box: {
    overflow: "hidden",
  },
});
