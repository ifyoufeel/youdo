/* Ports preview/app.js's OnboardingLocation — but for real: requests the
   actual OS foreground-location permission via expo-location instead of
   simulating the prompt, for an authentic ask with real graceful
   degradation on "Not now". Only the granted boolean would ever be worth
   keeping, never real coordinates — and nothing downstream in M1 reads
   even that yet (Browse centers on the signed-in user's seeded `home`
   point, not GPS; see useQuestsFeed, Phase 8), so this screen doesn't
   invent a place to persist it. Both choices proceed identically to
   sign-in next, matching the prototype's own behavior. */
import * as Location from "expo-location";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@design/components/Screen";
import { Icon } from "@design/components/Icon";
import { Button } from "@design/components/Button";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";

const TITLE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export default function LocationScreen() {
  const router = useRouter();

  async function handleAllow() {
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {
      // Denied, or the permission API itself failed — either way this
      // degrades gracefully (matching the prototype's own behavior):
      // proceed to sign-in regardless, never block on it.
    }
    router.push("/(onboarding)/signin");
  }

  function handleSkip() {
    router.push("/(onboarding)/signin");
  }

  return (
    <Screen
      onBack={() => router.back()}
      slab={
        <>
          <Button variant="secondary" onPress={handleSkip} testID="location-skip">
            {t("onboarding.location.skip")}
          </Button>
          <Button variant="primary" fullWidth icon="map-pin" onPress={handleAllow} testID="location-allow">
            {t("onboarding.location.allow")}
          </Button>
        </>
      }
      testID="onboarding-location"
    >
      <View style={styles.iconWrap}>
        <Icon name="map-pin" size={28} color={semantic.color.text.primary} />
      </View>
      <Text style={styles.title}>{t("onboarding.location.title")}</Text>
      <Text style={styles.body}>{t("onboarding.location.body")}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: raw.radius.pill,
    backgroundColor: semantic.color.surface.accent,
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
  },
  title: {
    fontFamily: TITLE_FONT,
    fontSize: raw.fontSize["2xl"],
    letterSpacing: raw.letterSpacing.heading,
    color: semantic.color.text.primary,
  },
  body: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.md,
    lineHeight: raw.fontSize.md * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
});
