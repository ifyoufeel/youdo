/* Ports preview/app.js's OnboardingSignIn. One real difference from the
   prototype: signInWithGoogle() here actually awaits the memory
   adapter's simulated latency (120-400ms), so the "Signing in…" loading
   state the prototype's UI code carried but never triggered (its mock
   resolved synchronously) is real now — shown while the request is in
   flight, not vestigial markup.

   The Apple button (M8) is the real native
   AppleAuthenticationButton — Apple's own App Store guideline (4.8)
   requires its official button/branding wherever Sign in with Apple is
   offered, not a custom-styled Button matching this screen's other two.
   iOS-only: AppleAuthentication.isAvailableAsync() resolves false
   everywhere else, and the component itself renders nothing when
   unavailable — the availability check here just avoids reserving empty
   layout space for it on other platforms while that resolves. */
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
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

type SigningInAs = "google" | "apple" | null;

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuthSession();
  const [signingIn, setSigningIn] = useState<SigningInAs>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    let cancelled = false;
    AppleAuthentication.isAvailableAsync().then((available) => {
      if (!cancelled) setAppleAvailable(available);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGoogle() {
    setSigningIn("google");
    try {
      await signInWithGoogle();
      router.replace("/");
    } catch {
      setSigningIn(null);
    }
  }

  async function handleApple() {
    setSigningIn("apple");
    try {
      await signInWithApple();
      router.replace("/");
    } catch {
      setSigningIn(null);
    }
  }

  return (
    <Screen onBack={() => router.back()} testID="onboarding-signin">
      <Text style={styles.title}>{t("onboarding.signin.title")}</Text>
      <Text style={styles.body}>{t("onboarding.signin.body")}</Text>

      {signingIn ? (
        <LoadingState label={t(signingIn === "apple" ? "onboarding.signin.loadingApple" : "onboarding.signin.loading")} />
      ) : (
        <View style={styles.actions}>
          <Button variant="primary" fullWidth onPress={handleGoogle} testID="signin-google">
            {t("onboarding.signin.google")}
          </Button>
          {appleAvailable ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={raw.radius.md}
              style={styles.appleButton}
              onPress={handleApple}
              testID="signin-apple"
            />
          ) : null}
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
  appleButton: {
    width: "100%",
    height: 44,
  },
});
