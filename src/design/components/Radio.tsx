/* Ports ds-bundle.js's Radio (767-856) — label + optional description, a
   22x22 pill with an inner dot when selected. Same shadow simplification
   as Checkbox (see its own header comment) — flat, state-colored, no
   hover/press elevation. No native `name`/`value` grouping: RN has no
   HTML radio-group semantics, so a group of Radios is just several
   independently-controlled instances whose `checked` a parent derives
   from one selected value (BrowseScreen's sort field, Phase 9). */
import { Pressable, View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.medium);
const DESCRIPTION_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface RadioProps {
  label: string;
  description?: string;
  checked: boolean;
  onSelect: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Radio({ label, description, checked, onSelect, disabled = false, style, testID }: RadioProps) {
  const ringBorder = disabled ? raw.color.ink["200"] : semantic.color.border.strong;
  const ringBg = disabled ? raw.color.ink["100"] : semantic.color.surface.card;
  const dotColor = disabled ? raw.color.ink["300"] : raw.color.ink["900"];
  const labelColor = disabled ? raw.color.ink["300"] : semantic.color.text.primary;
  const descriptionColor = disabled ? raw.color.ink["300"] : semantic.color.text.secondary;

  return (
    <Pressable
      disabled={disabled}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      style={[styles.row, { alignItems: description ? "flex-start" : "center" }, style]}
      testID={testID}
    >
      <View style={[styles.ring, { backgroundColor: ringBg, borderColor: ringBorder, marginTop: description ? 2 : 0 }]}>
        {checked ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      </View>
      <View style={styles.textColumn}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {description ? <Text style={[styles.description, { color: descriptionColor }]}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    minHeight: raw.layout.hitTargetMin,
  },
  ring: {
    width: 22,
    height: 22,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: raw.border.width,
    borderRadius: raw.radius.pill,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: raw.radius.pill,
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
});
