/* Ports app.js's CancelSheet (1197-1248). One deliberate copy divergence:
   the web version's accepted-offer subtitle and refund card both claim
   "the money goes straight back" — but M4's acceptOffer never actually
   holds anything (LedgerPort stays 100% NotImplementedYet until M5), so
   there is nothing to refund yet either. Reworded to state only what's
   actually true today: the other side is told. CANCEL_REASONS stays a
   plain literal-string list, not routed through t() — same precedent
   wizardForm.ts's DURATIONS/EXPIRY_OPTIONS already set. */
import { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Dialog } from "@design/components/Dialog";
import { Card } from "@design/components/Card";
import { Radio } from "@design/components/Radio";
import { Input } from "@design/components/Input";
import { Button } from "@design/components/Button";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";

const CANCEL_REASONS = [
  "My plans changed",
  "I can't make the time any more",
  "We agreed to call it off",
  "The other person stopped replying",
  "Something else",
] as const;

const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const EYEBROW_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);

export interface CancelSheetProps {
  open: boolean;
  onClose: () => void;
  hasAcceptedOffer: boolean;
  onConfirm: (reason: string) => void;
  submitting?: boolean;
}

export function CancelSheet({ open, onClose, hasAcceptedOffer, onConfirm, submitting = false }: CancelSheetProps) {
  const [reason, setReason] = useState<string>(CANCEL_REASONS[0]);
  const [other, setOther] = useState("");

  // Reset each time the sheet opens — same "adjust state during render"
  // pattern OfferSheet's own draft-reseeding already uses.
  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setReason(CANCEL_REASONS[0]);
    setOther("");
  } else if (open !== wasOpen) {
    setWasOpen(open);
  }

  const text = reason === "Something else" ? other : reason;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("cancelSheet.title")}
      subtitle={hasAcceptedOffer ? t("cancelSheet.subtitleAccepted") : t("cancelSheet.subtitleOpen")}
      testID="cancel-sheet"
      actions={
        <>
          <Button variant="ghost" onPress={onClose}>
            {t("cancelSheet.keepIt")}
          </Button>
          <Button
            variant="danger"
            fullWidth
            disabled={!text.trim() || submitting}
            onPress={() => onConfirm(text)}
            testID="cancel-sheet-confirm"
          >
            {t("cancelSheet.confirm")}
          </Button>
        </>
      }
    >
      {hasAcceptedOffer ? (
        <Card variant="sunken" padding="md">
          <Text style={styles.bodyText}>{t("cancelSheet.noRefundNote")}</Text>
        </Card>
      ) : null}
      <Text style={styles.eyebrow}>{t("cancelSheet.whyLabel")}</Text>
      {CANCEL_REASONS.map((r) => (
        <Radio key={r} label={r} checked={reason === r} onSelect={() => setReason(r)} />
      ))}
      {reason === "Something else" ? (
        <Input
          label={t("cancelSheet.otherLabel")}
          multiline
          rows={2}
          value={other}
          onChangeText={setOther}
          placeholder={t("cancelSheet.otherPlaceholder")}
          testID="cancel-other"
        />
      ) : null}
      <Text style={styles.footnote}>{t("cancelSheet.footnote")}</Text>
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
  },
  bodyText: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: semantic.color.text.primary,
  },
  footnote: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize["2xs"],
    lineHeight: raw.fontSize["2xs"] * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
});
