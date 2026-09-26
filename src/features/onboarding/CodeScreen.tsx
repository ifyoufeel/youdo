/* Ports preview/app.js's OnboardingCode. The prototype's one
   deliberately-wrong code ("000000") and its exact copy ("That code
   didn't match…") now live behind AuthPort as InvalidOtpError (Phase 0
   of this milestone) — this screen's job is just to catch it and render
   the same copy via the i18n seam, not to know the sentinel value
   itself. */
import { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@design/components/Screen";
import { Button } from "@design/components/Button";
import { Input } from "@design/components/Input";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { useAuthSession } from "@data/auth-session";
import { InvalidOtpError } from "@data/ports/auth";
import { t } from "../../i18n/t";
import { useOnboardingDraft } from "./OnboardingContext";

const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export default function CodeScreen() {
  const router = useRouter();
  const { sendOtp, verifyOtp } = useAuthSession();
  const draft = useOnboardingDraft();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify() {
    if (draft.code.length !== 6) {
      draft.setCodeError(t("onboarding.code.tooShort"));
      return;
    }
    draft.setCodeError(null);
    setVerifying(true);
    try {
      await verifyOtp(draft.contact, draft.code);
      router.replace("/");
    } catch (e) {
      if (e instanceof InvalidOtpError) {
        draft.setCodeError(t("onboarding.code.wrong"));
        draft.setCode("");
      } else {
        throw e;
      }
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await sendOtp(draft.contact, draft.mode);
      draft.setCode("");
      draft.setCodeError(null);
    } finally {
      setResending(false);
    }
  }

  return (
    <Screen
      onBack={() => router.back()}
      title={t("onboarding.code.title")}
      slab={
        <>
          <Button variant="secondary" onPress={() => router.back()}>
            {t("onboarding.code.back")}
          </Button>
          <Button variant="primary" fullWidth onPress={handleVerify} disabled={verifying} testID="code-verify">
            {t("onboarding.code.verify")}
          </Button>
        </>
      }
      testID="onboarding-code"
    >
      <Text style={styles.body}>{t("onboarding.code.body", { contact: draft.contact })}</Text>

      <Input
        label={t("onboarding.code.label")}
        value={draft.code}
        onChangeText={draft.setCode}
        placeholder="000000"
        error={draft.codeError ?? undefined}
        keyboardType="number-pad"
        maxLength={6}
        testID="code-input"
      />

      <Button variant="ghost" onPress={handleResend} disabled={resending} testID="code-resend">
        {t("onboarding.code.resend")}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.md,
    lineHeight: raw.fontSize.md * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
});
