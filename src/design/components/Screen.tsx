/* The `Screen` shell ROADMAP's own M0 checklist called for but M0 didn't
   build: SafeArea + TopBar + scroll body + sticky bottom slab, ported
   from how preview/app.js hand-assembles every screen out of its local
   Body/Slab helpers plus ds-bundle.js's TopBar (there was never a single
   wrapping component enforcing the pattern on the web side either). */
import type { ReactNode } from "react";
import { View, ScrollView, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopBar } from "./TopBar";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";

export interface ScreenProps {
  title?: string;
  subtitle?: string;
  wordmark?: boolean;
  onBack?: () => void;
  topBarActions?: ReactNode;
  /** Sticky bottom action bar content — omit for no Slab at all. */
  slab?: ReactNode;
  /** false when children manage their own scrolling (e.g. a FlashList
      feed) — Screen then renders a plain flexed container instead of a
      second ScrollView, which RN would otherwise warn about nesting
      VirtualizedLists inside. Default true. */
  scroll?: boolean;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Screen({
  title,
  subtitle,
  wordmark,
  onBack,
  topBarActions,
  slab,
  scroll = true,
  children,
  contentStyle,
  testID,
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]} testID={testID}>
      <TopBar title={title} subtitle={subtitle} wordmark={wordmark} onBack={onBack} actions={topBarActions} />
      {scroll ? (
        <ScrollView style={styles.flex} contentContainerStyle={[styles.body, contentStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
      {slab ? <View style={styles.slab}>{slab}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: semantic.color.surface.page,
  },
  flex: {
    flex: 1,
  },
  body: {
    padding: raw.layout.gutterScreen,
    paddingTop: 16,
    gap: raw.layout.stackDefault,
  },
  slab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: raw.layout.gutterScreen,
    paddingVertical: 12,
    backgroundColor: semantic.color.surface.card,
    borderTopWidth: raw.border.width,
    borderTopColor: semantic.color.border.strong,
  },
});
