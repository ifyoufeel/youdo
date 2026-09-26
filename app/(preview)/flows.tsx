/* ADR-008's "flows (scripted two-sided walkthroughs)" — first flows.tsx
   entry: sign-in → browse → filter → save, M1's own headline flow, now
   extended by M2 into sign-in → browse → detail → offer → confirmation.
   Tapping a card in the Browse frame is real in-app navigation (the same
   router.push BrowseScreen always used), so it lands on the actual
   /quest/[id] route, outside this frame's bounds and back under
   app/_layout.tsx's own root providers, not this page's — a reviewer can
   sign in, search, tap a card, make an offer, see the confirmation toast,
   and use the browser's back button to return here, exactly as a real
   user would. That's why frames 2 and 3 use AutoSignInAmbient (signs in
   against the ambient root session) rather than AutoSignedIn (an
   isolated one, still right for frame 1's standalone SignInScreen demo
   and for screens.tsx's specimens, none of which navigate away): an
   isolated session would vanish the moment either frame's real
   navigation left its own provider subtree. The third frame renders
   QuestDetailScreen directly on one of the signed-in demo user's own
   posted quests — substituting for a dev actor switcher, since there's
   no "my quests" tab yet to tap through to it in-app (same call M1's
   Browse gallery made about roles it can't reach by tapping alone). */
import type { ReactNode } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider } from "@data/auth-session";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import SignInScreen from "@features/onboarding/SignInScreen";
import { BrowseScreen } from "@features/browse/BrowseScreen";
import { QuestDetailScreen } from "@features/quest-detail/QuestDetailScreen";
import { AutoSignInAmbient } from "./_components/AutoSignInAmbient";

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
        Sign in → browse → filter → save → detail → offer → confirmation. Each frame below is the
        real screen, wired to the real memory adapter — try it: sign in with Google in the first
        frame, then in the second search, open Sort and filter, tap a heart, then tap any quest
        that isn&apos;t your own to open its real detail page, make an offer, and watch the
        confirmation toast name the real poster. Browser back returns you here.
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
        2 · Browse → filter → save → detail → offer — auto-signed-in, tap a card for the real
        quest-detail route
      </Text>
      <FlowFrame>
        <AutoSignInAmbient>
          <BrowseScreen />
        </AutoSignInAmbient>
      </FlowFrame>

      <Text style={styles.specimenLabel}>
        3 · Your own posted quest — the poster&apos;s trust panel replaced by a plain offer count,
        no dead &quot;Review offers&quot; button
      </Text>
      <FlowFrame>
        <AutoSignInAmbient>
          <QuestDetailScreen questId="q6" />
        </AutoSignInAmbient>
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
