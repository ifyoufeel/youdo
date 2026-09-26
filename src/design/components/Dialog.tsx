/* Ports ds-bundle.js's Dialog (1951-2046) — both variants ("sheet",
   bottom sheet; "default", centered popup) in one component since M2's
   offer sheet and M6's rate sheet will both reuse it.

   Built on RN's own Modal (transparent, onRequestClose for the Android
   hardware back button, for free) + a Pressable backdrop + an
   Animated.View using Reanimated's declarative entering/exiting layout
   animations — no @gorhom/bottom-sheet, no new react-native-gesture-
   handler dependency. Reanimated is already a direct dependency, proven
   cross-platform by Sticker (ADR-003). Swipe-to-dismiss is out of scope
   for M1 (tap-outside or the Close button only) — the 44x4 drag handle on
   the sheet variant is decorative, matching that scope call; the web
   version's scale+fade "pop-in" for the default variant is approximated
   here as a plain fade, the same kind of acknowledged simplification as
   IconButton's shadow-ladder note. The web version scrolls its whole
   card (overflowY: auto on the 88%-max-height container, ds-bundle.js
   line 1982); this scrolls just the body instead, leaving header and
   actions pinned — the usual native-sheet shape, and needed for real
   once M3's posting wizard opens a Select with 30+ options (Time) that
   the original 4-option radius picker never exercised. */
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { IconButton } from "./IconButton";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const TITLE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const SUBTITLE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export type DialogVariant = "sheet" | "default";

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  variant?: DialogVariant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Dialog({ open, onClose, title, subtitle, children, actions, variant = "sheet", style, testID }: DialogProps) {
  if (!open) return null;
  const sheet = variant === "sheet";

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { justifyContent: sheet ? "flex-end" : "center" }]}
        onPress={onClose}
        testID={testID ? `${testID}-backdrop` : undefined}
      >
        <Animated.View
          entering={sheet ? SlideInDown.duration(raw.duration.sheet) : FadeIn.duration(raw.duration.base)}
          exiting={sheet ? SlideOutDown.duration(raw.duration.sheet) : FadeOut.duration(raw.duration.base)}
          style={[
            styles.card,
            sheet
              ? { borderTopLeftRadius: raw.radius.sheet, borderTopRightRadius: raw.radius.sheet }
              : { maxWidth: 360, borderRadius: raw.radius.xl, alignSelf: "center" },
            style,
          ]}
        >
          <Pressable onPress={() => {}} testID={testID}>
            {sheet ? <View style={styles.handle} /> : null}
            {title || subtitle || onClose ? (
              <View style={styles.header}>
                <View style={styles.headerText}>
                  {title ? <Text style={styles.title}>{title}</Text> : null}
                  {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
                {onClose ? <IconButton icon="x" accessibilityLabel="Close" variant="ghost" size="sm" onPress={onClose} /> : null}
              </View>
            ) : null}
            <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
            {actions ? <View style={styles.actions}>{actions}</View> : null}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    backgroundColor: semantic.color.surface.overlay,
  },
  card: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: semantic.color.surface.card,
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    padding: 20,
    paddingTop: 18,
  },
  handle: {
    width: 44,
    height: 4,
    alignSelf: "center",
    backgroundColor: raw.color.ink["200"],
    borderRadius: raw.radius.pill,
    marginTop: -6,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: TITLE_FONT,
    fontSize: raw.fontSize.xl,
    letterSpacing: raw.letterSpacing.heading,
    color: semantic.color.text.primary,
  },
  subtitle: {
    fontFamily: SUBTITLE_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.secondary,
    marginTop: 4,
  },
  bodyScroll: {
    maxHeight: 360,
  },
  body: {
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
});
