/* Ports preview/app.js's DepositSheet (1495-1541). `presetMinor`/`reason`
   exist for M5 Phase 7's second real consumer — the offer inbox's
   contextual "you're short" trigger, prefilled to the exact shortfall —
   not used by ProfileScreen's own plain "Add money" button, which opens
   it with neither. Same "adjusting state when a prop changes" re-seed
   pattern as OfferSheet: the draft amount resets to the preset (or empty)
   every time the sheet opens, not just on mount. */
import { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Dialog } from "@design/components/Dialog";
import { Tag } from "@design/components/Tag";
import { Input } from "@design/components/Input";
import { Card } from "@design/components/Card";
import { InfoRow } from "@design/components/InfoRow";
import { Button } from "@design/components/Button";
import { Icon } from "@design/components/Icon";
import { money, formatMoney } from "@data/contracts";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { parseAmountInput } from "./parseAmountInput";

const NOTE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const REASON_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

// Three fit on one row at phone width, and bracket what a poster actually
// needs (preview/app.js:1491-1494) — anything larger goes in the field.
const TOPUP_AMOUNTS = [50000, 100000, 200000];

export interface DepositSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amountMinor: number) => void;
  bank: string;
  availableMinor: number;
  presetMinor?: number;
  reason?: string;
  submitting?: boolean;
}

export function DepositSheet({ open, onClose, onSubmit, bank, availableMinor, presetMinor = 0, reason, submitting = false }: DepositSheetProps) {
  const [amountText, setAmountText] = useState(presetMinor > 0 ? String(Math.ceil(presetMinor / 100)) : "");

  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setAmountText(presetMinor > 0 ? String(Math.ceil(presetMinor / 100)) : "");
  } else if (open !== wasOpen) {
    setWasOpen(open);
  }

  const amountMinor = parseAmountInput(amountText);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("wallet.deposit.title")}
      subtitle={t("wallet.deposit.subtitle", { bank })}
      testID="deposit-sheet"
      actions={
        <>
          <Button variant="ghost" onPress={onClose}>
            {t("wallet.deposit.cancel")}
          </Button>
          <Button
            fullWidth
            variant="money"
            icon="plus"
            disabled={amountMinor <= 0 || submitting}
            onPress={() => onSubmit(amountMinor)}
            testID="deposit-submit"
          >
            {t("wallet.deposit.submit")}
          </Button>
        </>
      }
    >
      {reason ? (
        <Card variant="sunken" padding="md">
          <View style={styles.reasonRow}>
            <Icon name="info" size={16} color={raw.color.ink["500"]} style={styles.reasonIcon} />
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        </Card>
      ) : null}
      <View style={styles.presets}>
        {TOPUP_AMOUNTS.map((v) => (
          <Tag key={v} selected={amountMinor === v} onSelect={() => setAmountText(String(v / 100))}>
            {formatMoney(money(v))}
          </Tag>
        ))}
      </View>
      <Input
        label={t("wallet.deposit.customLabel")}
        prefix="NT$"
        keyboardType="decimal-pad"
        value={amountText}
        onChangeText={(text) => setAmountText(text.replace(/[^0-9.]/g, ""))}
        testID="deposit-amount"
      />
      <Card variant="sunken" padding="md">
        <InfoRow icon="credit-card" label={t("wallet.deposit.from")} value={bank} />
        <InfoRow icon="wallet" label={t("wallet.deposit.walletAfter")} value={formatMoney(money(availableMinor + amountMinor))} />
      </Card>
      <Text style={styles.note}>{t("wallet.deposit.note")}</Text>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reasonRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  reasonIcon: {
    marginTop: 1,
  },
  reasonText: {
    flex: 1,
    fontFamily: REASON_FONT,
    fontSize: raw.fontSize["2xs"],
    lineHeight: raw.fontSize["2xs"] * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
  note: {
    fontFamily: NOTE_FONT,
    fontSize: raw.fontSize["2xs"],
    lineHeight: raw.fontSize["2xs"] * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
});
