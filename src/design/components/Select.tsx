/* Ports ds-bundle.js's Select (861+) — but RN has no equivalent of an
   HTML <select>, so rather than inventing a native-picker integration,
   this opens the same Dialog(sheet) BrowseScreen's filter sheet itself
   uses, with a Radio list inside. One picker pattern for the app, not
   two. */
import { useState } from "react";
import { Pressable, View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "./Icon";
import { Dialog } from "./Dialog";
import { Radio } from "./Radio";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const FIELD_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Shown, muted, when `value` matches none of `options` — e.g. a field
      with no natural default (the posting wizard's Date/Time) rather
      than one seeded from the first option. */
  placeholder?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Select({ label, value, options, onChange, placeholder, disabled = false, style, testID }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.column, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          { backgroundColor: disabled ? raw.color.ink["100"] : semantic.color.surface.card },
        ]}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text
          style={[
            styles.fieldText,
            { color: disabled ? raw.color.ink["300"] : selected ? semantic.color.text.primary : raw.color.ink["300"] },
          ]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder ?? ""}
        </Text>
        <Icon name="chevron-down" size={18} color={disabled ? raw.color.ink["300"] : raw.color.ink["400"]} />
      </Pressable>

      <Dialog open={open} onClose={() => setOpen(false)} title={label} variant="sheet" testID={testID ? `${testID}-sheet` : undefined}>
        <View style={styles.optionList}>
          {options.map((option) => (
            <Radio
              key={option.value}
              label={option.label}
              checked={option.value === value}
              onSelect={() => {
                onChange(option.value);
                setOpen(false);
              }}
            />
          ))}
        </View>
      </Dialog>
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    minHeight: raw.layout.controlHeightMd,
    paddingHorizontal: 14,
    borderWidth: raw.border.width,
    borderColor: raw.color.ink["200"],
    borderRadius: raw.radius.field,
  },
  fieldText: {
    flex: 1,
    minWidth: 0,
    fontFamily: FIELD_FONT,
    fontSize: raw.fontSize.md,
  },
  optionList: {
    gap: 2,
  },
});
