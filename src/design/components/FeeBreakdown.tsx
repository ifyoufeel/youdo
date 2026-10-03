/* Ports ds-bundle.js's FeeBreakdown (app.js:1161-1178) — the disclosure
   shown before a poster commits to a price, both in the posting wizard's
   Budget/Review steps and (later, M4/M5) wherever a fee needs disclosing
   again. */
import { View, Text, StyleSheet } from "react-native";
import { Card } from "./Card";
import { InfoRow } from "./InfoRow";
import { money, formatMoney } from "@data/contracts";
import { feeOn, feeRateLabel, netOn } from "@data/domain/fees";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";
import { t } from "../../i18n/t";

const SECTION_LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const NOTE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface FeeBreakdownProps {
  amountMinor: number;
  title?: string;
  note?: string;
  /** The doer's-eye view of the same breakdown ("You receive" instead of
      "The doer receives") — unused until M4/M5 actually show this to a
      doer, but the prototype's own component already takes it, so the
      port does too rather than adding it back later. */
  doerSide?: boolean;
}

export function FeeBreakdown({ amountMinor, title, note, doerSide = false }: FeeBreakdownProps) {
  const fee = feeOn(amountMinor);
  const net = netOn(amountMinor);
  return (
    <Card variant="sunken" padding="md">
      <Text style={styles.sectionLabel}>{title ?? t("feeBreakdown.defaultTitle")}</Text>
      <View style={styles.rows}>
        <InfoRow label={t("feeBreakdown.price")} value={formatMoney(money(amountMinor))} />
        <InfoRow label={t("feeBreakdown.fee", { rate: feeRateLabel() })} value={`−${formatMoney(money(fee))}`} />
        <InfoRow
          label={doerSide ? t("feeBreakdown.youReceive") : t("feeBreakdown.doerReceives")}
          value={formatMoney(money(net))}
        />
      </View>
      <Text style={styles.note}>{note ?? t("feeBreakdown.defaultNote", { amount: formatMoney(money(amountMinor)) })}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: SECTION_LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.secondary,
  },
  rows: {
    marginTop: 8,
    gap: 6,
  },
  note: {
    marginTop: 8,
    fontFamily: NOTE_FONT,
    fontSize: raw.fontSize["2xs"],
    lineHeight: raw.fontSize["2xs"] * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
});
