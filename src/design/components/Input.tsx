/* Ports ds-bundle.js's Input (652-762) — label, hint/error, icon,
   prefix/suffix, single-line or multiline. RN's TextInput reports text
   via onChangeText (a string), not a DOM change event, so that's this
   component's callback shape too — the one real API difference from the
   web version, not a design decision. keyboardType/maxLength/
   autoCapitalize/autoComplete pass straight through: onboarding's Contact
   screen needs an email/phone keyboard, and Code needs a numeric, 6-char
   one (Phase 6). */
import { useState } from "react";
import { View, Text, TextInput, StyleSheet, type StyleProp, type ViewStyle, type TextInputProps } from "react-native";
import { Icon, type IconName } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const FIELD_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const PREFIX_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const SUFFIX_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const HINT_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface InputProps {
  label?: string;
  hint?: string;
  error?: string;
  icon?: IconName;
  prefix?: string;
  suffix?: string;
  multiline?: boolean;
  rows?: number;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  maxLength?: number;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Input({
  label,
  hint,
  error,
  icon,
  prefix,
  suffix,
  multiline = false,
  rows = 4,
  value,
  onChangeText,
  placeholder,
  disabled = false,
  keyboardType,
  maxLength,
  autoCapitalize,
  autoComplete,
  style,
  testID,
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? raw.color.danger["500"] : focused ? raw.color.ink["900"] : raw.color.ink["200"];
  const iconColor = disabled ? raw.color.ink["300"] : focused ? raw.color.ink["900"] : raw.color.ink["400"];

  return (
    <View style={[styles.column, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          multiline ? styles.fieldMultiline : styles.fieldSingle,
          {
            backgroundColor: disabled ? raw.color.ink["100"] : semantic.color.surface.card,
            borderColor: disabled ? raw.color.ink["200"] : borderColor,
          },
        ]}
      >
        {icon ? <Icon name={icon} size={18} color={iconColor} style={multiline ? styles.multilineIcon : undefined} /> : null}
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={raw.color.ink["300"]}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? rows : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          style={[
            styles.fieldText,
            multiline ? styles.fieldTextMultiline : styles.fieldTextSingle,
            { color: disabled ? raw.color.ink["300"] : semantic.color.text.primary },
          ]}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      {error || hint ? (
        <View style={styles.helpRow}>
          {error ? <Icon name="alert-triangle" size={13} strokeWidth={2} color={semantic.color.text.danger} /> : null}
          <Text style={[styles.help, { color: error ? semantic.color.text.danger : semantic.color.text.secondary }]}>
            {error || hint}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 6,
    width: "100%",
  },
  label: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  field: {
    flexDirection: "row",
    gap: 8,
    borderWidth: raw.border.width,
    borderRadius: raw.radius.field,
  },
  fieldSingle: {
    alignItems: "center",
    minHeight: raw.layout.controlHeightMd,
    paddingHorizontal: 14,
  },
  fieldMultiline: {
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  multilineIcon: {
    marginTop: 2,
  },
  fieldText: {
    flex: 1,
    minWidth: 0,
    fontFamily: FIELD_FONT,
    fontSize: raw.fontSize.md,
  },
  fieldTextSingle: {
    paddingVertical: 10,
  },
  fieldTextMultiline: {
    textAlignVertical: "top",
  },
  prefix: {
    fontFamily: PREFIX_FONT,
    fontSize: raw.fontSize.md,
    color: raw.color.ink["500"],
  },
  suffix: {
    fontFamily: SUFFIX_FONT,
    fontSize: raw.fontSize.sm,
    color: raw.color.ink["400"],
  },
  helpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  help: {
    fontFamily: HINT_FONT,
    fontSize: raw.fontSize.xs,
  },
});
