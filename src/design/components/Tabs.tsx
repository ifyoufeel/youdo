/* Ports ds-bundle.js's Tabs (1130-1219) — segmented variant only. The
   prototype's own "underline" variant has zero consumers anywhere in
   preview/app.js; MyQuestsScreen (M3) is the one real user of this
   component and only ever renders "segmented", so that's the only mode
   built here — same "one pattern, not two" discipline Select.tsx's own
   header comment already sets. */
import { Pressable, View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const COUNT_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Tabs({ items, value, onChange, style, testID }: TabsProps) {
  return (
    <View style={[styles.bar, style]} accessibilityRole="tablist" testID={testID}>
      {items.map((item) => {
        const on = item.value === value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={item.label}
            style={[styles.tab, on ? styles.tabOn : styles.tabOff]}
            testID={testID ? `${testID}-${item.value}` : undefined}
          >
            <Text style={[styles.label, { color: on ? semantic.color.text.primary : raw.color.ink["500"] }]}>
              {item.label}
            </Text>
            {item.count != null ? (
              <View style={styles.count}>
                <Text style={styles.countText}>{item.count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    backgroundColor: semantic.color.surface.sunken,
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    borderRadius: raw.radius.pill,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: raw.radius.pill,
    borderWidth: raw.border.hair,
  },
  tabOn: {
    backgroundColor: raw.color.paper["000"],
    borderColor: semantic.color.border.strong,
  },
  tabOff: {
    borderColor: "transparent",
  },
  label: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize.sm,
  },
  count: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: raw.color.paper["200"],
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.strong,
    borderRadius: raw.radius.pill,
  },
  countText: {
    fontFamily: COUNT_FONT,
    fontSize: 11,
    color: raw.color.ink["900"],
  },
});
