/* Ports preview/app.js's report Dialog (3748-3769) — both real now:
   "Send report" creates an actual Report record (nothing reads it back,
   see contracts/report.ts), and "Block this person" — decorative in the
   prototype, no onClick at all — really blocks, filtering this person's
   quests out of the blocker's browse feed from then on. Kept in the same
   place the prototype puts it (inside the report sheet, not a separate
   trigger) since that's still the only real surface either action has. */
import { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Dialog } from "@design/components/Dialog";
import { Radio } from "@design/components/Radio";
import { Button } from "@design/components/Button";
import { raw } from "@design/tokens/raw";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";

const REPORT_REASONS = [
  "They didn't turn up",
  "They asked me to pay outside the app",
  "The quest wasn't what was described",
  "They were rude or threatening",
  "Something else",
] as const;

const EYEBROW_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);

export interface ReportSheetProps {
  open: boolean;
  onClose: () => void;
  name: string;
  onReport: (reason: string) => void;
  onBlock: () => void;
  submitting?: boolean;
  blocking?: boolean;
}

export function ReportSheet({ open, onClose, name, onReport, onBlock, submitting = false, blocking = false }: ReportSheetProps) {
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);

  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setReason(REPORT_REASONS[0]);
  } else if (open !== wasOpen) {
    setWasOpen(open);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("reportSheet.title", { name })}
      subtitle={t("reportSheet.subtitle")}
      testID="report-sheet"
      actions={
        <>
          <Button variant="ghost" onPress={onClose}>
            {t("reportSheet.cancel")}
          </Button>
          <Button
            variant="danger"
            fullWidth
            disabled={submitting}
            onPress={() => onReport(reason)}
            testID="report-sheet-confirm"
          >
            {t("reportSheet.send")}
          </Button>
        </>
      }
    >
      <Text style={styles.eyebrow}>{t("reportSheet.whatHappened")}</Text>
      {REPORT_REASONS.map((r) => (
        <Radio key={r} label={r} checked={reason === r} onSelect={() => setReason(r)} />
      ))}
      <Button variant="secondary" fullWidth icon="eye" disabled={blocking} onPress={onBlock} testID="block-user">
        {t("reportSheet.block")}
      </Button>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: EYEBROW_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: raw.color.ink["500"],
  },
});
