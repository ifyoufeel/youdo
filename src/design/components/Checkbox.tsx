/* Ports ds-bundle.js's Checkbox (566-647) — label + optional description,
   a 22x22 box with a check glyph when ticked. One acknowledged
   simplification: the web version adds a hover/press hard-offset shadow
   to the box, whose ladder (none at rest unchecked, sticker-sm checked,
   sticker on hover, pressed on press) has a variable base offset Sticker's
   fixed-preset API doesn't model. A form control's checkbox isn't the
   brand's shadow showcase the way Button/Card/Sticker itself is — same
   scope call as IconButton's shadow-ladder note — so this ships as a
   flat, state-colored box instead of a bespoke shadow animation. */
import { Pressable, View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.medium);
const DESCRIPTION_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface CheckboxProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Checkbox({ label, description, checked, onChange, disabled = false, style, testID }: CheckboxProps) {
  const boxBg = disabled ? raw.color.ink["100"] : checked ? raw.color.lime["500"] : semantic.color.surface.card;
  const boxBorder = disabled ? raw.color.ink["200"] : semantic.color.border.strong;
  const labelColor = disabled ? raw.color.ink["300"] : semantic.color.text.primary;
  const descriptionColor = disabled ? raw.color.ink["300"] : semantic.color.text.secondary;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      style={[styles.row, { alignItems: description ? "flex-start" : "center" }, style]}
      testID={testID}
    >
      <View style={[styles.box, { backgroundColor: boxBg, borderColor: boxBorder, marginTop: description ? 2 : 0 }]}>
        {checked ? <Icon name="check" size={14} strokeWidth={3.25} color={raw.color.ink["900"]} /> : null}
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
  box: {
    width: 22,
    height: 22,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: raw.border.width,
    borderRadius: raw.radius.xs,
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
