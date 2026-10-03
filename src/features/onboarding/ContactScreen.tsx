/* Ports preview/app.js's OnboardingContact. The email/phone toggle uses
   two Tag chips (selected/onSelect) rather than the general segmented
   Tabs primitive — deliberately not ported for M1, see Tag.tsx's own
   header comment. Validation regexes match the prototype's exactly. */
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@design/components/Screen";
import { Button } from "@design/components/Button";
import { Input } from "@design/components/Input";
import { Tag } from "@design/components/Tag";
import { raw } from "@design/tokens/raw";
import { useAuthSession } from "@data/auth-session";
import { t } from "../../i18n/t";
import { useOnboardingDraft } from "./OnboardingContext";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^\+?[0-9\s]{8,}$/;

export default function ContactScreen() {
  const router = useRouter();
  const { sendOtp } = useAuthSession();
  const draft = useOnboardingDraft();
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const value = draft.contact.trim();
    const valid = draft.mode === "email" ? EMAIL_RE.test(value) : PHONE_RE.test(value);
    if (!valid) {
      draft.setContactError(
        draft.mode === "email" ? t("onboarding.contact.invalidEmail") : t("onboarding.contact.invalidPhone")
      );
      return;
    }
    draft.setContactError(null);
    setSending(true);
    try {
      await sendOtp(value, draft.mode);
      draft.setCode("");
      draft.setCodeError(null);
      router.push("/(onboarding)/code");
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen
      onBack={() => router.back()}
      title={t("onboarding.contact.title")}
      slab={
        <>
          <Button variant="secondary" onPress={() => router.back()}>
            {t("onboarding.contact.back")}
          </Button>
          <Button variant="primary" fullWidth onPress={handleSend} disabled={sending} testID="contact-send">
            {t("onboarding.contact.send")}
          </Button>
        </>
      }
      testID="onboarding-contact"
    >
      <View style={styles.tabs}>
        <Tag selected={draft.mode === "email"} onSelect={() => draft.setMode("email")}>
          {t("onboarding.contact.emailTab")}
        </Tag>
        <Tag selected={draft.mode === "phone"} onSelect={() => draft.setMode("phone")}>
          {t("onboarding.contact.phoneTab")}
        </Tag>
      </View>

      {draft.mode === "email" ? (
        <Input
          label={t("onboarding.contact.emailLabel")}
          value={draft.contact}
          onChangeText={draft.setContact}
          icon="send"
          placeholder={t("onboarding.contact.emailPlaceholder")}
          error={draft.contactError ?? undefined}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          testID="contact-input"
        />
      ) : (
        <Input
          label={t("onboarding.contact.phoneLabel")}
          value={draft.contact}
          onChangeText={draft.setContact}
          icon="message-square"
          placeholder={t("onboarding.contact.phonePlaceholder")}
          error={draft.contactError ?? undefined}
          keyboardType="phone-pad"
          autoComplete="tel"
          testID="contact-input"
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    gap: raw.space["2"],
  },
});
