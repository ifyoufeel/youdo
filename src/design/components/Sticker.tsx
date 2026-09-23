/* <Sticker elevation color> (ADR-003) — the brand's hard offset shadow,
   as a duplicated offset View behind the content, not Android `elevation`
   (wrong look: blurred, symmetric) and not the RN `boxShadow` style prop
   (a string Reanimated can't interpolate, so the press animation would be
   a discrete jump instead of the continuous "pushes into paper" feel).

   Two independent motions layer on top of each other here, deliberately:
   - The shadow sibling repositions to sticker-math's shadowDx/Dy
     INSTANTLY (no animation) on every state change.
   - The content's translate animates smoothly (Reanimated withTiming).
   On the web the real box-shadow offset animates smoothly too (it's in
   --transition-control's own property list) — RN can't do that for a
   style value, per ADR-003's own reasoning above — but the shadow deltas
   here are only 1-2px, so an instant reposition reads as part of the same
   continuous motion rather than a jump; the content's larger, animated
   translate is what actually carries the "pushes into paper" feel.

   WATCH (ADR-003): a consumer with `overflow: hidden` content (Card's
   media block) must put that clip on an inner View, never on the View
   this component itself renders — Sticker's shadow sibling is a true
   sibling of `children`, never a descendant, so there is structurally no
   way to nest a clip around it by accident. */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { stickerGeometry, type StickerElevation } from "./sticker-math";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";

export type { StickerElevation };

export interface StickerProps {
  /** Base (rest) shadow size. Default "md" — matches ds-bundle.js's
      default --shadow-sticker, the one every existing web component
      actually uses. */
  elevation?: StickerElevation;
  /** Shadow fill color. Default ink-900 — the one Card's "inverse"
      variant overrides to lime-700 (--shadow-sticker-lime). */
  color?: string;
  /** Must match the wrapped content's own border radius, or the shadow
      sibling's corners won't line up with it. Required — there is no
      brand-wide default radius a shadow can safely assume. */
  radius: number;
  /** Tracks hover/press and animates accordingly. false renders a static
      sticker with no interaction (a plain, non-clickable Card). */
  interactive?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children: ReactNode;
}

const DURATION_MS = raw.duration.fast;
const EASING = Easing.bezier(...raw.easing.snap);

export function Sticker({
  elevation = "md",
  color = semantic.shadow.sticker.color,
  radius,
  interactive = false,
  disabled = false,
  onPress,
  onPressIn,
  onPressOut,
  style,
  testID,
  children,
}: StickerProps) {
  const [state, setState] = useState<"rest" | "hover" | "press">("rest");
  const geometry = useMemo(() => stickerGeometry(elevation, disabled ? "rest" : state), [elevation, disabled, state]);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateX.value = withTiming(geometry.contentTranslateX, { duration: DURATION_MS, easing: EASING });
    translateY.value = withTiming(geometry.contentTranslateY, { duration: DURATION_MS, easing: EASING });
  }, [geometry.contentTranslateX, geometry.contentTranslateY, translateX, translateY]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  const shadowStyle: ViewStyle = {
    position: "absolute",
    top: geometry.shadowDy,
    left: geometry.shadowDx,
    right: -geometry.shadowDx,
    bottom: -geometry.shadowDy,
    backgroundColor: color,
    borderRadius: radius,
  };

  const content = (
    <Animated.View style={[{ borderRadius: radius }, animatedContentStyle]}>{children}</Animated.View>
  );

  if (!interactive) {
    return (
      <View style={[styles.wrapper, style]}>
        <View style={shadowStyle} />
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <View style={shadowStyle} />
      <Pressable
        testID={testID}
        disabled={disabled}
        onPress={onPress}
        onHoverIn={() => setState((s) => (s === "press" ? s : "hover"))}
        onHoverOut={() => setState("rest")}
        onPressIn={() => {
          setState("press");
          onPressIn?.();
        }}
        onPressOut={() => {
          setState("hover"); // still hovering (mouse hasn't left) — onHoverOut settles it to rest
          onPressOut?.();
        }}
      >
        {content}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
});
