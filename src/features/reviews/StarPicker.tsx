/* Ports preview/app.js's StarPicker (1280-1303) — five 44x44 pressable
   stars. The web version tracks a separate hover state to preview the
   rating before commit; native has no hover, so `shown` is just `value`
   here — the same simplification Checkbox/Radio's own tap-only affordance
   already makes elsewhere in this codebase. */
import { Pressable, View, StyleSheet } from "react-native";
import { Icon } from "@design/components/Icon";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";

export interface StarPickerProps {
  value: number;
  onChange: (value: number) => void;
  testID?: string;
}

const STARS = [1, 2, 3, 4, 5];

export function StarPicker({ value, onChange, testID }: StarPickerProps) {
  return (
    <View style={styles.row} testID={testID}>
      {STARS.map((n) => {
        const on = n <= value;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            accessibilityRole="button"
            accessibilityLabel={n === 1 ? "1 star" : `${n} stars`}
            accessibilityState={{ selected: on }}
            style={[styles.star, { backgroundColor: on ? raw.color.coin["500"] : raw.color.paper["000"] }]}
            testID={testID ? `${testID}-${n}` : undefined}
          >
            <Icon name="star" size={19} filled={on} strokeWidth={2} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
  },
  star: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    borderRadius: raw.radius.pill,
  },
});
