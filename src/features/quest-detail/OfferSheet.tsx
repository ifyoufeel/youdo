/* Ports preview/app.js's offer Dialog (2026-2063): asking price or a
   custom amount, plus a note. Purely presentational — the parent
   (QuestDetailScreen) owns the mutation via useSendOffer and controls
   `open`/`submitting`/`errorMessage`; this sheet never closes itself on
   submit, so a guard rejection (own quest, already offered, ...) stays
   visible inline rather than the sheet vanishing on a failed attempt. */
import { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Dialog } from "@design/components/Dialog";
import { Radio } from "@design/components/Radio";
import { Input } from "@design/components/Input";
import { Button } from "@design/components/Button";
import { money, formatMoney } from "@data/contracts";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";

type OfferMode = "asking" | "custom";

export interface OfferSheetProps {
  open: boolean;
  onClose: () => void;
  askingPriceMinor: number;
  posterName: string;
  onSubmit: (amountMinor: number, note: string) => void;
  submitting?: boolean;
  errorMessage?: string | null;
}

export function OfferSheet({
  open,
  onClose,
  askingPriceMinor,
  posterName,
  onSubmit,
  submitting = false,
  errorMessage = null,
}: OfferSheetProps) {
  const [mode, setMode] = useState<OfferMode>("asking");
  const [priceText, setPriceText] = useState(String(askingPriceMinor / 100));
  const [note, setNote] = useState("");

  // "Adjusting state when a prop changes" (react.dev), not an effect —
  // same pattern FilterSortSheet uses to re-seed its own draft each time
  // it opens, here resetting the offer form instead of carrying a stale
  // draft (or a previous attempt's error) into the next open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setMode("asking");
    setPriceText(String(askingPriceMinor / 100));
    setNote("");
  } else if (open !== wasOpen) {
    setWasOpen(open);
  }

  const amountMinor =
    mode === "asking" ? askingPriceMinor : Math.max(0, Math.round(parseFloat(priceText || "0") * 100));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("offer.title")}
      subtitle={t("offer.subtitle")}
      testID="offer-sheet"
      actions={
        <Button
          fullWidth
          variant="money"
          onPress={() => onSubmit(amountMinor, note)}
          disabled={amountMinor <= 0 || submitting}
          testID="offer-submit"
        >
          {t("offer.submit")}
        </Button>
      }
    >
      <Radio
        label={t("offer.modeAsking", { amount: formatMoney(money(askingPriceMinor)) })}
        description={t("offer.modeAskingDescription")}
        checked={mode === "asking"}
        onSelect={() => setMode("asking")}
      />
      <Radio
        label={t("offer.modeCustom")}
        description={t("offer.modeCustomDescription")}
        checked={mode === "custom"}
        onSelect={() => setMode("custom")}
      />
      {mode === "custom" ? (
        <Input
          label={t("offer.priceLabel")}
          prefix="NT$"
          keyboardType="decimal-pad"
          value={priceText}
          onChangeText={setPriceText}
          testID="offer-price"
        />
      ) : null}
      <Input
        label={t("offer.noteLabel")}
        placeholder={t("offer.notePlaceholder")}
        multiline
        rows={2}
        value={note}
        onChangeText={setNote}
        testID="offer-note"
      />
      <Text style={styles.feeNote}>{t("offer.feeNote", { posterName })}</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </Dialog>
  );
}

const styles = StyleSheet.create({
  feeNote: {
    fontFamily: fontFamilyName(raw.font.text, raw.fontWeight.regular),
    fontSize: raw.fontSize.xs,
    color: semantic.color.text.secondary,
  },
  error: {
    fontFamily: fontFamilyName(raw.font.text, raw.fontWeight.medium),
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.danger,
  },
});
