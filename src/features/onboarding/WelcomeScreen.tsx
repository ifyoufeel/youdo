/* Ports preview/app.js's OnboardingWelcome — the first-run explainer
   pitching both sides of the marketplace in one look. */
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@design/components/Screen";
import { Card } from "@design/components/Card";
import { Icon, type IconName } from "@design/components/Icon";
import { Button } from "@design/components/Button";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";

const EYEBROW_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const TITLE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.black);
const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const PITCH_TITLE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const PITCH_BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

function Pitch({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <Card variant="flat" padding="md">
      <View style={styles.pitchRow}>
        <View style={styles.pitchIcon}>
          <Icon name={icon} size={20} color={semantic.color.text.primary} />
        </View>
        <View style={styles.pitchText}>
          <Text style={styles.pitchTitle}>{title}</Text>
          <Text style={styles.pitchBody}>{body}</Text>
        </View>
      </View>
    </Card>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen
      wordmark
      slab={
        <Button variant="primary" fullWidth icon="arrow-right" onPress={() => router.push("/(onboarding)/location")}>
          {t("onboarding.welcome.cta")}
        </Button>
      }
      testID="onboarding-welcome"
    >
      <Text style={styles.eyebrow}>{t("onboarding.welcome.eyebrow")}</Text>
      <Text style={styles.title}>{t("onboarding.welcome.title")}</Text>
      <Text style={styles.body}>{t("onboarding.welcome.body")}</Text>

      <Pitch
        icon="briefcase"
        title={t("onboarding.welcome.pitchPoster.title")}
        body={t("onboarding.welcome.pitchPoster.body")}
      />
      <Pitch
        icon="coins"
        title={t("onboarding.welcome.pitchDoer.title")}
        body={t("onboarding.welcome.pitchDoer.body")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: EYEBROW_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.secondary,
  },
  title: {
    fontFamily: TITLE_FONT,
    fontSize: raw.fontSize["3xl"],
    letterSpacing: raw.letterSpacing.display,
    lineHeight: raw.fontSize["3xl"] * raw.lineHeight.tight,
    color: semantic.color.text.primary,
  },
  body: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.md,
    lineHeight: raw.fontSize.md * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
  pitchRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  pitchIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: raw.radius.pill,
    backgroundColor: semantic.color.surface.accent,
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.strong,
  },
  pitchText: {
    flex: 1,
    gap: 2,
  },
  pitchTitle: {
    fontFamily: PITCH_TITLE_FONT,
    fontSize: raw.fontSize.md,
    color: semantic.color.text.primary,
  },
  pitchBody: {
    fontFamily: PITCH_BODY_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.secondary,
  },
});
