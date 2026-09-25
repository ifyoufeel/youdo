/* ADR-008's registry: "screens (empty / loading / error / full / long-
   content)". First screens.tsx entry — the Screen shell (Phase 2 of M1)
   in its four states. Each is a real, standalone Screen render, not a
   mockup — proving the shell + EmptyState/LoadingState/ErrorState
   actually compose the way a real feature screen will use them. */
import type { ReactNode } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Screen } from "@design/components/Screen";
import { EmptyState } from "@design/components/EmptyState";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { Card } from "@design/components/Card";
import { Button } from "@design/components/Button";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";

const HEADING_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const LABEL_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);

function SectionHeading({ children }: { children: string }) {
  return <Text style={styles.sectionHeading}>{children}</Text>;
}

/* Each specimen is a fixed-height frame around a real <Screen> — Screen
   itself wants to fill its container (SafeAreaView flex:1), so the frame
   gives it something bounded to fill inside this scrolling gallery. */
function ScreenFrame({ children }: { children: ReactNode }) {
  return <View style={styles.frame}>{children}</View>;
}

export default function ScreensScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Screen gallery</Text>

      <SectionHeading>Empty</SectionHeading>
      <Text style={styles.specimenLabel}>Screen · EmptyState · with a named next action</Text>
      <ScreenFrame>
        <Screen title="Browse">
          <EmptyState title="No quests nearby yet" action="Widen search" onAction={() => {}} />
        </Screen>
      </ScreenFrame>

      <SectionHeading>Loading</SectionHeading>
      <Text style={styles.specimenLabel}>Screen · LoadingState · no shimmer, per the design system&apos;s own rule</Text>
      <ScreenFrame>
        <Screen title="Browse">
          <LoadingState label="Finding quests near you…" />
        </Screen>
      </ScreenFrame>

      <SectionHeading>Error</SectionHeading>
      <Text style={styles.specimenLabel}>Screen · ErrorState · written as a fix, with a real retry action</Text>
      <ScreenFrame>
        <Screen title="Browse">
          <ErrorState onRetry={() => {}} />
        </Screen>
      </ScreenFrame>

      <SectionHeading>Full</SectionHeading>
      <Text style={styles.specimenLabel}>Screen · populated body · TopBar back + Slab action</Text>
      <ScreenFrame>
        <Screen
          title="Quest detail"
          subtitle="Da'an · 5 min walk"
          onBack={() => {}}
          slab={
            <Button variant="primary" fullWidth onPress={() => {}}>
              Accept offer
            </Button>
          }
        >
          <Card padding="md">
            <Text>Walk Biscuit for an hour — NT$400</Text>
          </Card>
          <Card padding="md">
            <Text>A very slow beagle who stops at every tree.</Text>
          </Card>
        </Screen>
      </ScreenFrame>
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
  sectionHeading: {
    fontFamily: HEADING_FONT,
    fontSize: raw.fontSize.xl,
    color: semantic.color.text.primary,
    marginTop: raw.layout.stackLoose,
  },
  specimenLabel: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  frame: {
    height: 420,
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.default,
    borderRadius: raw.radius.sm,
    overflow: "hidden",
  },
});
