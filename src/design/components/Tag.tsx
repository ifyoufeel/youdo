/* Ports ds-bundle.js's Tag (500-561) — a selectable pill chip. Doubles as
   the email/phone toggle on onboarding's Contact screen (Phase 6): the
   prototype's general segmented `Tabs` primitive is deliberately not
   ported for M1 (nothing else needs it yet), and two Tags with
   selected/onSelect already reproduce that exact visual. */
import { useState } from "react";
import { Pressable, View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Icon, type IconName } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

export type TagSize = "sm" | "md";

const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);

export interface TagProps {
  children: string;
  icon?: IconName;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  size?: TagSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Tag({ children, icon, selected = false, onSelect, onRemove, size = "md", style, testID }: TagProps) {
  const [hovered, setHovered] = useState(false);
  const interactive = !!onSelect;
  const sm = size === "sm";
  const bg = selected ? raw.color.ink["900"] : hovered && interactive ? semantic.color.surface.page : semantic.color.surface.card;
  const fg = selected ? semantic.color.text.inverse : semantic.color.text.primary;

  const content = (
    <>
      {icon ? <Icon name={icon} size={sm ? 13 : 15} strokeWidth={2} color={fg} /> : null}
      <Text style={[styles.label, { fontSize: sm ? raw.fontSize.xs : raw.fontSize.sm, color: fg }]}>{children}</Text>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={styles.remove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${children}`}
        >
          <Icon name="x" size={sm ? 12 : 14} strokeWidth={2.5} color={fg} />
        </Pressable>
      ) : null}
    </>
  );

  const boxStyle = [
    styles.base,
    { height: sm ? 30 : 36, paddingHorizontal: sm ? 11 : 14, backgroundColor: bg },
    style,
  ];

  if (!interactive) {
    return (
      <View style={boxStyle} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onSelect}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={boxStyle}
      testID={testID}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: raw.radius.pill,
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
  },
  label: {
    fontFamily: LABEL_FONT,
  },
  remove: {
    marginRight: -3,
    opacity: 0.7,
  },
});
