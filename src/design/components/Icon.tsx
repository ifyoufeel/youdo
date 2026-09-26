/* Renders ICON_SHAPES 1:1 via react-native-svg — same viewBox, same
   fill/stroke logic as ds-bundle.js's web Icon (preview/ds-bundle.js:66-109).

   One deliberate behavior change from the web version: `color` defaults
   to a real token (semantic.color.text.primary / ink-900) instead of the
   CSS `"currentColor"` default. RN has no CSS currentColor inheritance —
   there is no parent text color for an SVG to inherit — so a caller that
   wants to match surrounding text now passes that color explicitly. */
import Svg, { Path, Circle, Rect } from "react-native-svg";
import type { ViewStyle, StyleProp } from "react-native";
import { ICON_SHAPES } from "../icons/shapes";
import type { IconName } from "../icons/names";
import { semantic } from "../tokens/semantic";

export type { IconName };

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
  /** Default: semantic.color.text.primary (ink-900) — see the module
      comment above for why this isn't "currentColor". */
  color?: string;
  style?: StyleProp<ViewStyle>;
  /** Mirrors the web version's aria-hidden-unless-labelled rule: an icon
      with no accessibilityLabel is decorative and hidden from
      assistive tech; give it one when the icon is the only content of a
      control (ds-bundle.js:81, `"aria-hidden": rest["aria-label"] ?
      undefined : true`). */
  accessibilityLabel?: string;
}

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  filled = false,
  color = semantic.color.text.primary,
  style,
  accessibilityLabel,
}: IconProps) {
  const shapes = ICON_SHAPES[name];
  return (
    <Svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? color : "none"}
      stroke={filled ? "none" : color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? "yes" : "no-hide-descendants"}
      style={style}
    >
      {shapes.map((s, i) => {
        if (s[0] === "circle") {
          const [, cx, cy, r] = s;
          return <Circle key={i} cx={cx} cy={cy} r={r} />;
        }
        if (s[0] === "rect") {
          const [, x, y, width, height, rx] = s;
          return <Rect key={i} x={x} y={y} width={width} height={height} rx={rx} />;
        }
        const [, d] = s;
        return <Path key={i} d={d} />;
      })}
    </Svg>
  );
}
