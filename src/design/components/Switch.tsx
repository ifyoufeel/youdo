/* Ports ds-bundle.js's Switch (components/forms/Switch.jsx:959-1038) — a
   52x30 pill track with a 22x22 thumb sliding between left:2 (off) and
   left:24 (on). Built day one as a real design-system primitive (not
   feature-local) per the same precedent Checkbox/Radio set in M1 — no
   need to wait for a second consumer once a control this generic exists.

   One acknowledged simplification, same call Checkbox.tsx's own header
   comment already makes: the web version's hover hard-offset shadow
   (sticker-sm + a 1px translate on the track) has no mobile equivalent
   and isn't this control's job to dramatize, so it ships flat. The
   thumb's slide is real, though — Reanimated withTiming with the same
   duration-base/ease-snap tokens the web version's CSS transition uses,
   the same pairing Sticker.tsx already established for token-driven
   motion. */
import { useEffect } from "react";
import { Pressable, View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.medium);
const DESCRIPTION_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const EASING = Easing.bezier(...raw.easing.snap);
const THUMB_OFF = 2;
const THUMB_ON = 24;

export interface SwitchProps {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Switch({ label, description, checked, onChange, disabled = false, style, testID }: SwitchProps) {
  const thumbLeft = useSharedValue(checked ? THUMB_ON : THUMB_OFF);
  useEffect(() => {
    thumbLeft.value = withTiming(checked ? THUMB_ON : THUMB_OFF, { duration: raw.duration.base, easing: EASING });
  }, [checked, thumbLeft]);
  const thumbStyle = useAnimatedStyle(() => ({ left: thumbLeft.value }));

  const trackBg = disabled ? raw.color.ink["100"] : checked ? raw.color.lime["500"] : raw.color.paper["200"];
  const trackBorder = disabled ? raw.color.ink["200"] : semantic.color.border.strong;
  const thumbBg = disabled ? raw.color.ink["300"] : raw.color.ink["900"];
  const labelColor = disabled ? raw.color.ink["300"] : semantic.color.text.primary;
  const descriptionColor = disabled ? raw.color.ink["300"] : semantic.color.text.secondary;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange(!checked)}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      style={[styles.row, { justifyContent: label ? "space-between" : "flex-start" }, style]}
      testID={testID}
    >
      {label ? (
        <View style={styles.textColumn}>
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
          {description ? <Text style={[styles.description, { color: descriptionColor }]}>{description}</Text> : null}
        </View>
      ) : null}
      <View style={[styles.track, { backgroundColor: trackBg, borderColor: trackBorder }]}>
        <Animated.View style={[styles.thumb, { backgroundColor: thumbBg }, thumbStyle]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: raw.layout.hitTargetMin,
  },
  textColumn: {
    gap: 2,
    flexShrink: 1,
  },
  label: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize.md,
  },
  description: {
    fontFamily: DESCRIPTION_FONT,
    fontSize: raw.fontSize.xs,
  },
  track: {
    width: 52,
    height: 30,
    flexShrink: 0,
    borderWidth: raw.border.width,
    borderRadius: raw.radius.pill,
  },
  thumb: {
    position: "absolute",
    top: 2,
    width: 22,
    height: 22,
    borderRadius: raw.radius.pill,
  },
});
