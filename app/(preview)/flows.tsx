/* ADR-008's "flows (scripted two-sided walkthroughs)" — first flows.tsx
   entry: sign-in → browse → filter → save, M1's own headline flow. In the
   real app "browse", "filter" and "save" are all one screen (the filter
   sheet and save button both live on BrowseScreen itself, not separate
   routes) — so this is two live frames, not four, an honest reflection
   of the real navigation graph rather than an invented four-step story.
   Each frame gets its own fresh provider subtree (same reasoning as
   screens.tsx's per-specimen OnboardingProvider instances), so this page
   composes real, independently-interactive screens — a reviewer can
   actually sign in, search, open the filter sheet, apply it and tap
   save — rather than a scripted animation standing in for one. */
import type { ReactNode } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider } from "@data/auth-session";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import SignInScreen from "@features/onboarding/SignInScreen";
import { BrowseScreen } from "@features/browse/BrowseScreen";
import { AutoSignedIn } from "./_components/AutoSignedIn";

const HEADING_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const LABEL_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);

function FlowFrame({ children }: { children: ReactNode }) {
  return <View style={styles.frame}>{children}</View>;
}

export default function FlowsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Flow gallery</Text>
      <Text style={styles.intro}>
        Sign in → browse → filter → save. Each frame below is the real screen, wired to the real
        memory adapter — try it: sign in with Google in the first frame, then search, open Sort and
        filter, apply it, and tap a heart in the second.
      </Text>

      <Text style={styles.specimenLabel}>1 · Sign in — real AuthSessionProvider, memory adapter</Text>
      <FlowFrame>
        <RepositoryProvider>
          <AuthSessionProvider>
            <SignInScreen />
          </AuthSessionProvider>
        </RepositoryProvider>
      </FlowFrame>

      <Text style={styles.specimenLabel}>
        2 · Browse → filter → save — auto-signed-in, real feed/search/filter-sheet/save
      </Text>
      <FlowFrame>
        <AutoSignedIn>
          <BrowseScreen />
        </AutoSignedIn>
      </FlowFrame>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: semantic.color.surface.page,
  },
  content: {
    padding: raw.layout.gutterScreen,
    gap: raw.layout.stackDefault,
  },
  title: {
    fontFamily: HEADING_FONT,
    fontSize: raw.fontSize["3xl"],
    color: semantic.color.text.primary,
  },
  intro: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
  specimenLabel: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  frame: {
    height: 640,
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.default,
    borderRadius: raw.radius.sm,
    overflow: "hidden",
  },
});
