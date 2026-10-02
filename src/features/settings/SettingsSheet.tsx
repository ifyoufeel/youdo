/* Ports preview/app.js's Settings Dialog (3495-3574). Notifications
   (Switch list, AsyncStorage-backed — see useNotificationPrefs.ts),
   Account (phone/email), Where you are (Area Select + Locate me), and
   Session (Sign out) are all real. Verification stays the prototype's
   own decorative "Verify identity" toast-only button on purpose — PRD
   line 76 calls the verification badge "manual/stubbed at launch"
   explicitly, so this isn't a gap, it's the spec. Payment method stays a
   read-only InfoRow, matching the prototype (no bank-account management
   UI exists anywhere in the source). Delete account is real now too
   (DeleteAccountDialog.tsx's own header comment).

   One deliberate divergence from the prototype: phone/email are buffered
   in local state and committed together on "Done", not fired to
   updateProfile on every keystroke. The prototype's per-keystroke
   `app.updateProfile({phone: ev.target.value})` is safe there because
   its state write is synchronous; here each call is a real, independently
   -latency-jittered round trip (ADR-004), so rapid typing could resolve
   out of order and flash the field back to a shorter, stale value.
   Area/Locate-me stay immediate-fire like the prototype — a discrete
   Select change, not a keystroke stream, has no such race. */
import { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Dialog } from "@design/components/Dialog";
import { Switch } from "@design/components/Switch";
import { Input } from "@design/components/Input";
import { Select } from "@design/components/Select";
import { Button } from "@design/components/Button";
import { Card } from "@design/components/Card";
import { Icon } from "@design/components/Icon";
import { Avatar } from "@design/components/Avatar";
import { Badge } from "@design/components/Badge";
import { InfoRow } from "@design/components/InfoRow";
import type { User } from "@data/contracts";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { useAreas } from "@features/post-quest/useAreas";
import { useAuthSession } from "@data/auth-session";
import { useNotificationPrefs } from "./useNotificationPrefs";
import { useUpdateProfile } from "./useUpdateProfile";
import { useUploadAvatar } from "./useUploadAvatar";
import { useDeleteAccount } from "./useDeleteAccount";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

const EYEBROW_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export function SettingsSheet({ open, onClose, user }: SettingsSheetProps) {
  const router = useRouter();
  const { signOut } = useAuthSession();
  const { data: areas = [] } = useAreas();
  const notifications = useNotificationPrefs();
  const updateProfile = useUpdateProfile(user.id);
  const uploadAvatar = useUploadAvatar(user.id);
  const deleteAccount = useDeleteAccount();

  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [justLocated, setJustLocated] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setPhone(user.phone);
    setEmail(user.email);
    setJustLocated(false);
  } else if (open !== wasOpen) {
    setWasOpen(open);
  }

  function commitAndClose() {
    if (phone !== user.phone || email !== user.email) {
      // Closes only once the write actually lands — same "onSuccess
      // closes the sheet" precedent as CancelSheet's own confirm — so a
      // reopen never races the mutation and shows a stale value.
      updateProfile.mutate({ phone, email }, { onSuccess: onClose });
    } else {
      onClose();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={commitAndClose}
      title={t("settings.title")}
      testID="settings-sheet"
      actions={
        <Button fullWidth disabled={updateProfile.isPending} onPress={commitAndClose} testID="settings-done">
          {t("settings.done")}
        </Button>
      }
    >
      <Text style={styles.eyebrow}>{t("settings.notifications")}</Text>
      <Switch
        label={t("settings.notif.offers.label")}
        description={t("settings.notif.offers.description")}
        checked={notifications.prefs.offers}
        onChange={() => notifications.toggle("offers")}
      />
      <Switch
        label={t("settings.notif.messages.label")}
        description={t("settings.notif.messages.description")}
        checked={notifications.prefs.messages}
        onChange={() => notifications.toggle("messages")}
      />
      <Switch
        label={t("settings.notif.reminders.label")}
        description={t("settings.notif.reminders.description")}
        checked={notifications.prefs.reminders}
        onChange={() => notifications.toggle("reminders")}
      />
      <Switch
        label={t("settings.notif.payments.label")}
        description={t("settings.notif.payments.description")}
        checked
        disabled
        onChange={() => {}}
      />

      <Text style={styles.eyebrow}>{t("settings.photo")}</Text>
      <View style={styles.photoRow}>
        <Avatar name={user.name} photoUrl={user.avatarUrl} size="lg" verified={user.verified} />
        <Button
          variant="secondary"
          icon="image"
          disabled={uploadAvatar.isPending}
          onPress={() => uploadAvatar.mutate()}
          testID="settings-change-photo"
        >
          {uploadAvatar.isPending ? t("settings.uploadingPhoto") : t("settings.changePhoto")}
        </Button>
      </View>

      <Text style={styles.eyebrow}>{t("settings.account")}</Text>
      <Input label={t("settings.phoneLabel")} icon="message-square" value={phone} onChangeText={setPhone} testID="settings-phone" />
      <Input label={t("settings.emailLabel")} icon="send" value={email} onChangeText={setEmail} testID="settings-email" />

      <Text style={styles.eyebrow}>{t("settings.whereYouAre")}</Text>
      <Select
        label={t("settings.areaLabel")}
        value={user.area}
        options={areas.map((a) => ({ value: a.name, label: a.name }))}
        onChange={(value) => {
          const area = areas.find((a) => a.name === value);
          if (!area) return;
          updateProfile.mutate({ area: area.name, home: area.point });
          setJustLocated(false);
        }}
        testID="settings-area"
      />
      <Text style={styles.hint}>
        {justLocated ? t("settings.areaHintLocated", { area: user.area }) : t("settings.areaHint")}
      </Text>
      <Button
        variant="secondary"
        fullWidth
        icon="map-pin"
        onPress={() => {
          // Locate me: same call as the prototype's own — moves the
          // grid anchor point to the area you already have. Real GPS
          // never enters this app's abstract flat-meter fixture grid
          // (M1's LocationScreen note), so there's nothing further to
          // "locate" — still a real mutation, not a dead click.
          const area = areas.find((a) => a.name === user.area);
          if (!area) return;
          updateProfile.mutate({ area: area.name, home: area.point });
          setJustLocated(true);
        }}
        testID="settings-locate-me"
      >
        {t("settings.locateMe")}
      </Button>

      <Text style={styles.eyebrow}>{t("settings.verification")}</Text>
      <Card variant="sunken" padding="md">
        <View style={styles.verifyRow}>
          <Icon name="shield-check" size={18} color={user.verified ? raw.color.success["600"] : raw.color.ink["400"]} />
          <Text style={styles.verifyText}>{user.verified ? t("settings.verifiedCopy") : t("settings.unverifiedCopy")}</Text>
          <Badge label={user.verified ? t("settings.verifiedBadge") : t("settings.notYetBadge")} tone={user.verified ? "success" : "neutral"} size="sm" />
        </View>
      </Card>
      {!user.verified ? (
        // Deliberately decorative — PRD line 76 names verification as
        // "manual/stubbed at launch." A toast, matching the prototype
        // exactly, not a gap.
        <Button variant="secondary" fullWidth icon="shield-check" onPress={() => {}} testID="settings-verify">
          {t("settings.verifyIdentity")}
        </Button>
      ) : null}

      <Text style={styles.eyebrow}>{t("settings.paymentMethod")}</Text>
      <Card variant="sunken" padding="md">
        <InfoRow icon="credit-card" label={t("settings.bankAccount")} value={user.bank} />
      </Card>

      <Text style={styles.eyebrow}>{t("settings.session")}</Text>
      <Button
        variant="secondary"
        fullWidth
        icon="x"
        onPress={async () => {
          onClose();
          await signOut();
          router.replace("/(onboarding)/welcome");
        }}
        testID="settings-sign-out"
      >
        {t("settings.signOut")}
      </Button>

      <Button
        variant="secondary"
        fullWidth
        icon="trash"
        style={styles.deleteButton}
        onPress={() => setDeleteDialogOpen(true)}
        testID="settings-delete-account"
      >
        {t("settings.deleteAccount")}
      </Button>
      <Text style={styles.disclaimer}>{t("settings.deleteDisclaimer")}</Text>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        submitting={deleteAccount.isPending}
        onConfirm={() => {
          deleteAccount.mutate(undefined, {
            onSuccess: () => {
              setDeleteDialogOpen(false);
              onClose();
            },
          });
        }}
      />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: EYEBROW_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.secondary,
    marginTop: 8,
  },
  hint: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  verifyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  verifyText: {
    flex: 1,
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  deleteButton: {
    marginTop: 8,
  },
  disclaimer: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize["2xs"],
    lineHeight: raw.fontSize["2xs"] * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
});
