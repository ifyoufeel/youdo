/* Ports app.js's CancelSheet (1197-1248) in full now that M5's escrow is
   real: the accepted-offer subtitle and the "Refunded in full" InfoRow
   both restore the web version's exact money-forward copy, since
   cancelQuest genuinely refunds the held amount (escrow.ts's
   refundEscrow) rather than the M4-era "nothing was ever held" state.
   `refundMinor` replaces the boolean `hasAcceptedOffer` — null means no
   offer was ever accepted (nothing to refund, matching the plain "Cancel
   quest" subtitle); a number is the exact amount that comes back.
   CANCEL_REASONS stays a plain literal-string list, not routed through
   t() — same precedent wizardForm.ts's DURATIONS/EXPIRY_OPTIONS already
   set. */
import { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Card } from "@design/components/Card";
import { Dialog } from "@design/components/Dialog";
import { InfoRow } from "@design/components/InfoRow";
import { Radio } from "@design/components/Radio";
import { Input } from "@design/components/Input";
import { Button } from "@design/components/Button";
import { money, formatMoney } from "@data/contracts";
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
  /** null when no offer was ever accepted (nothing to refund); the exact
      amount that comes back otherwise. */
  refundMinor: number | null;
  onConfirm: (reason: string) => void;
  submitting?: boolean;
}

export function CancelSheet({ open, onClose, refundMinor, onConfirm, submitting = false }: CancelSheetProps) {
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
      subtitle={refundMinor !== null ? t("cancelSheet.subtitleAccepted") : t("cancelSheet.subtitleOpen")}
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
      {refundMinor !== null ? (
        <Card variant="sunken" padding="md">
          <InfoRow icon="coins" label={t("cancelSheet.refundedInFull")} value={formatMoney(money(refundMinor))} />
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
  footnote: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize["2xs"],
    lineHeight: raw.fontSize["2xs"] * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
});
