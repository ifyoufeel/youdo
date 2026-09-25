/* Ports ds-bundle.js's IconButton (421-495) — same Sticker-wrapped shadow
   pattern as Button.tsx, reused here rather than reinvented.

   One acknowledged simplification: the web version hand-tunes its own
   three-state shadow ladder (rest var(--shadow-sticker-sm), hover
   var(--shadow-sticker-lg), press var(--shadow-pressed)) instead of using
   a single Sticker elevation preset's formula. Sticker's "md" elevation
   (BASE_OFFSET 3) computes rest=3/hover=5/press=1 — hover and press match
   the web ladder exactly, rest differs by a single, imperceptible pixel.
   Adding a bespoke elevation preset to Sticker for one component's exact
   numbers isn't worth it — same call ADR-003 already made for Card's
   flat/sunken quirk. */
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Sticker } from "./Sticker";
import { Icon, type IconName } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";

export type IconButtonVariant = "primary" | "secondary" | "inverse" | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";
export type IconButtonShape = "circle" | "field";

const SIZES: Record<IconButtonSize, number> = {
  sm: raw.layout.controlHeightSm,
  md: raw.layout.controlHeightMd,
  lg: raw.layout.controlHeightLg,
};

const ICON_SIZES: Record<IconButtonSize, number> = { sm: 17, md: 20, lg: 22 };

export interface IconButtonProps {
  icon: IconName;
  /** Required, not optional — this is the control's only accessible
      label (there's no visible text). */
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  active?: boolean;
  disabled?: boolean;
  filled?: boolean;
  /** A small numeric/text badge, top-right — TopBar's notification bell,
      TabBar-adjacent triggers. */
  badge?: string | number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function IconButton({
  icon,
  accessibilityLabel,
  variant = "secondary",
  size = "md",
  shape = "circle",
  active = false,
  disabled = false,
  filled = false,
  badge,
  onPress,
  style,
  testID,
}: IconButtonProps) {
  const d = SIZES[size];
  const radius = shape === "circle" ? raw.radius.pill : raw.radius.field;
  const iconColor = variant === "inverse" ? semantic.color.text.inverse : disabled ? semantic.color.text.disabled : semantic.color.text.primary;

  const content = (
    <View style={[styles.base, { width: d, height: d, borderRadius: radius }]}>
      <Icon name={icon} size={ICON_SIZES[size]} strokeWidth={2} color={iconColor} filled={filled} />
      {badge !== undefined ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );

  if (variant === "ghost" || disabled) {
    return (
      <UnshadowedIconButton
        disabled={disabled}
        active={active}
        onPress={onPress}
        style={style}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        size={d}
        radius={radius}
      >
        {content}
      </UnshadowedIconButton>
    );
  }

  const bg = active || variant === "primary" ? semantic.color.action.primary.bg : variant === "inverse" ? semantic.color.action.inverse.bg : semantic.color.surface.card;

  return (
    <Sticker
      elevation="md"
      radius={radius}
      color={semantic.shadow.sticker.color}
      interactive
      onPress={onPress}
      style={style}
      testID={testID}
    >
      <View
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[styles.base, { width: d, height: d, borderRadius: radius, backgroundColor: bg, borderWidth: raw.border.width, borderColor: semantic.color.border.strong }]}
      >
        <Icon name={icon} size={ICON_SIZES[size]} strokeWidth={2} color={iconColor} filled={filled} />
        {badge !== undefined ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
    </Sticker>
  );
}

function UnshadowedIconButton({
  disabled,
  active,
  onPress,
  style,
  testID,
  accessibilityLabel,
  size,
  radius,
  children,
}: {
  disabled: boolean;
  active: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel: string;
  size: number;
  radius: number;
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const bg = disabled ? semantic.color.action.disabled.bg : active ? semantic.color.surface.sunken : hovered ? semantic.color.surface.sunken : "transparent";
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.base, { width: size, height: size, borderRadius: radius, backgroundColor: bg }, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: raw.color.flare["500"],
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    borderRadius: raw.radius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: raw.color.ink["900"],
    lineHeight: 13,
  },
});
