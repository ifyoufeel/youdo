/* A confirmation step the prototype's own "Delete account" button never
   had (no onClick at all) — real deletion needs one, matching every
   other destructive action in this codebase (CancelSheet, block). Its
   own Dialog, stacked on top of SettingsSheet's — RN's Modal layers
   natively, so two open Dialogs at once is fine. */
import { Text, StyleSheet } from "react-native";
import { Dialog } from "@design/components/Dialog";
import { Button } from "@design/components/Button";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";

const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitting?: boolean;
}

export function DeleteAccountDialog({ open, onClose, onConfirm, submitting = false }: DeleteAccountDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("deleteAccountDialog.title")}
      subtitle={t("deleteAccountDialog.subtitle")}
      testID="delete-account-dialog"
      actions={
        <>
          <Button variant="ghost" onPress={onClose}>
            {t("deleteAccountDialog.cancel")}
          </Button>
          <Button variant="danger" fullWidth disabled={submitting} onPress={onConfirm} testID="delete-account-confirm">
            {t("deleteAccountDialog.confirm")}
          </Button>
        </>
      }
    >
      <Text style={styles.body}>{t("deleteAccountDialog.body")}</Text>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: semantic.color.text.primary,
  },
});
