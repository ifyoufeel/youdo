/* Ports ds-bundle.js's TabBar (1045-1124) — 5 items rendered identically,
   no distinct raised FAB for "Post" (confirmed against the prototype).
   Active state is a lime pill behind the icon plus a bolder stroke width;
   that's the only visual difference from inactive. This component is
   presentational only — app/(tabs)/_layout.tsx wires it to Expo Router's
   <Tabs> as a custom tabBar renderer, not to a click handler here that
   owns navigation itself. */
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon, type IconName } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";

export interface TabBarItem {
  key: string;
  label: string;
  icon: IconName;
  badge?: string | number;
}

export interface TabBarProps {
  items: TabBarItem[];
  value: string;
  onChange: (key: string) => void;
  testID?: string;
}

export function TabBar({ items, value, onChange, testID }: TabBarProps) {
  return (
    <View style={styles.bar} testID={testID}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            style={styles.tab}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Icon
                name={item.icon}
                size={18}
                strokeWidth={active ? 2.25 : 1.9}
                color={active ? semantic.color.text.primary : raw.color.ink["400"]}
              />
              {item.badge !== undefined ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 2,
    height: raw.layout.tabbarHeight,
    paddingHorizontal: 8,
    backgroundColor: semantic.color.surface.card,
    borderTopWidth: raw.border.width,
    borderTopColor: semantic.color.border.strong,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  iconWrap: {
    position: "relative",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: raw.radius.pill,
    borderWidth: raw.border.width,
    borderColor: "transparent",
  },
  iconWrapActive: {
    backgroundColor: raw.color.lime["500"],
    borderColor: semantic.color.border.strong,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: raw.color.flare["500"],
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.strong,
    borderRadius: raw.radius.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: raw.color.ink["900"],
  },
});
