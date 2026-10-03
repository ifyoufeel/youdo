/* Ports preview/app.js's cash-out Dialog (ProfileScreen 3473-3493) — the
   mirror of DepositSheet, one real difference: it re-seeds its draft
   amount to the full spendable balance on open (matching the prototype's
   own useEffect keyed on the sheet's open state), since cashing out
   everything is the common case, not the exception. */
import { useState } from "react";
import { Dialog } from "@design/components/Dialog";
import { Input } from "@design/components/Input";
import { Card } from "@design/components/Card";
import { InfoRow } from "@design/components/InfoRow";
import { Button } from "@design/components/Button";
import { money, formatMoney } from "@data/contracts";
import { t } from "../../i18n/t";
import { parseAmountInput } from "./parseAmountInput";

export interface CashOutSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amountMinor: number) => void;
  bank: string;
  spendableMinor: number;
  submitting?: boolean;
}

export function CashOutSheet({ open, onClose, onSubmit, bank, spendableMinor, submitting = false }: CashOutSheetProps) {
  const [amountText, setAmountText] = useState(String(Math.floor(spendableMinor / 100)));

  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setAmountText(String(Math.max(0, Math.floor(spendableMinor / 100))));
  } else if (open !== wasOpen) {
    setWasOpen(open);
  }

  const amountMinor = parseAmountInput(amountText);
  const canCash = amountMinor > 0 && amountMinor <= spendableMinor;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("wallet.cashOut.title")}
      subtitle={t("wallet.cashOut.subtitle", { bank })}
      testID="cash-out-sheet"
      actions={
        <>
          <Button variant="ghost" onPress={onClose}>
            {t("wallet.cashOut.cancel")}
          </Button>
          <Button fullWidth variant="money" disabled={!canCash || submitting} onPress={() => onSubmit(amountMinor)} testID="cash-out-submit">
            {t("wallet.cashOut.submit")}
          </Button>
        </>
      }
    >
      <Input
        label={t("wallet.cashOut.amountLabel")}
        prefix="NT$"
        keyboardType="decimal-pad"
        value={amountText}
        onChangeText={(text) => setAmountText(text.replace(/[^0-9.]/g, ""))}
        hint={
          canCash || !amountText
            ? t("wallet.cashOut.hint", { amount: formatMoney(money(spendableMinor)) })
            : t("wallet.cashOut.hintOver", { amount: formatMoney(money(spendableMinor)) })
        }
        error={amountText && !canCash ? t("wallet.cashOut.error") : undefined}
        testID="cash-out-amount"
      />
      <Card variant="sunken" padding="md">
        <InfoRow icon="credit-card" label={t("wallet.cashOut.to")} value={bank} />
        <InfoRow icon="wallet" label={t("wallet.cashOut.leftAfter")} value={formatMoney(money(Math.max(0, spendableMinor - amountMinor)))} />
      </Card>
    </Dialog>
  );
}
