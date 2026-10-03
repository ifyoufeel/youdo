/* Ports ds-bundle.js's TopBar (1225-1306). Never carries a search field
   (confirmed against the prototype's own usage — BrowseScreen's search
   Input lives in the scroll body, not here); its only variation surface
   is back-arrow / title+subtitle / wordmark, plus an optional right-side
   actions slot. */
import type { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconButton } from "./IconButton";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const TITLE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const SUBTITLE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const WORDMARK_FONT = fontFamilyName(raw.font.display, raw.fontWeight.black);

export interface TopBarProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  /** Renders the "YouDO" logo lockup instead of title/subtitle — used on
      BrowseScreen, the app's one wordmark-carrying screen. */
  wordmark?: boolean;
  testID?: string;
}

export function TopBar({ title, subtitle, onBack, actions, wordmark = false, testID }: TopBarProps) {
  return (
    <View style={styles.bar} testID={testID}>
      {onBack ? <IconButton icon="chevron-left" accessibilityLabel="Back" size="sm" onPress={onBack} /> : null}
      <View style={styles.titleArea}>
        {wordmark ? (
          <Text style={styles.wordmark}>
            You
            <Text style={styles.wordmarkDo}>DO</Text>
          </Text>
        ) : (
          <View style={styles.titleColumn}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: raw.layout.topbarHeight,
    paddingHorizontal: raw.layout.gutterScreen,
    backgroundColor: semantic.color.surface.page,
    borderBottomWidth: raw.border.width,
    borderBottomColor: semantic.color.border.strong,
  },
  titleArea: {
    flex: 1,
    minWidth: 0,
  },
  titleColumn: {
    gap: 1,
  },
  title: {
    fontFamily: TITLE_FONT,
    fontSize: raw.fontSize.lg,
    letterSpacing: raw.letterSpacing.heading,
    lineHeight: raw.fontSize.lg * 1.1,
    color: semantic.color.text.primary,
  },
  subtitle: {
    fontFamily: SUBTITLE_FONT,
    fontSize: raw.fontSize.xs,
    color: semantic.color.text.secondary,
  },
  wordmark: {
    fontFamily: WORDMARK_FONT,
    fontSize: raw.fontSize["2xl"],
    letterSpacing: raw.letterSpacing.display,
    lineHeight: raw.fontSize["2xl"],
    color: semantic.color.text.primary,
  },
  wordmarkDo: {
    backgroundColor: raw.color.lime["500"],
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.strong,
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
