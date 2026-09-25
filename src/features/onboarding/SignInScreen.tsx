/* Ports preview/app.js's OnboardingSignIn. One real difference from the
   prototype: signInWithGoogle() here actually awaits the memory
   adapter's simulated latency (120-400ms), so the "Signing in…" loading
   state the prototype's UI code carried but never triggered (its mock
   resolved synchronously) is real now — shown while the request is in
   flight, not vestigial markup. */
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@design/components/Screen";
import { Button } from "@design/components/Button";
import { LoadingState } from "@design/components/LoadingState";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { useAuthSession } from "@data/auth-session";
import { t } from "../../i18n/t";

const TITLE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithGoogle } = useAuthSession();
  const [signingIn, setSigningIn] = useState(false);

  async function handleGoogle() {
    setSigningIn(true);
    try {
      await signInWithGoogle();
      router.replace("/");
    } catch {
      setSigningIn(false);
    }
  }

  return (
    <Screen onBack={() => router.back()} testID="onboarding-signin">
      <Text style={styles.title}>{t("onboarding.signin.title")}</Text>
      <Text style={styles.body}>{t("onboarding.signin.body")}</Text>

      {signingIn ? (
        <LoadingState label={t("onboarding.signin.loading")} />
      ) : (
        <View style={styles.actions}>
          <Button variant="primary" fullWidth onPress={handleGoogle} testID="signin-google">
            {t("onboarding.signin.google")}
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onPress={() => router.push("/(onboarding)/contact")}
            testID="signin-use-code"
          >
            {t("onboarding.signin.useCode")}
          </Button>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  actions: {
    gap: raw.layout.stackDefault,
    marginTop: raw.layout.stackLoose,
  },
});
