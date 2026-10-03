/* Ports preview/app.js's wallet-rows section of ProfileScreen
   (3418-3449), plus the in-flight payment rows M5 adds on top (nothing in
   the prototype ever stays pending). Pending/failed payments render
   first, newest first, then the classified ledger history — each row
   colored/worded by useWallet's classifyWalletRow, not by parsing a
   memo string (see domain/ledger.ts's header for why). `resolveTitle` is
   optional: the caller may resolve a row's questId to that quest's title
   (ProfileScreen does, from its own already-fetched quests); with none
   given, or none found, the ledger's own memo is shown instead. */
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@design/components/Card";
import { Badge, type BadgeTone } from "@design/components/Badge";
import { EmptyState } from "@design/components/EmptyState";
import { money, formatMoney, type Payment } from "@data/contracts";
import { formatStamp } from "@lib/format";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t, type StringKey } from "../../i18n/t";
import type { WalletHistoryRow } from "./useWallet";

const TITLE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const META_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const AMOUNT_FONT = fontFamilyName(raw.font.display, raw.fontWeight.black);

const KIND_TONE: Record<WalletHistoryRow["kind"], BadgeTone> = {
  held: "warning",
  released: "success",
  refunded: "success",
  added: "success",
  paid_in: "success",
  sent: "neutral",
  out: "neutral",
};

export interface WalletHistoryProps {
  history: WalletHistoryRow[];
  pendingPayments: Payment[];
  failedPayments: Payment[];
  now: number;
  resolveTitle?: (questId: string) => string | null;
  onBrowse?: () => void;
  testID?: string;
}

export function WalletHistory({ history, pendingPayments, failedPayments, now, resolveTitle, onBrowse, testID }: WalletHistoryProps) {
  const hasAnything = history.length > 0 || pendingPayments.length > 0 || failedPayments.length > 0;

  if (!hasAnything) {
    return <EmptyState title={t("wallet.historyEmpty")} action={onBrowse ? t("wallet.historyEmptyAction") : undefined} onAction={onBrowse} testID={testID} />;
  }

  return (
    <View style={styles.column} testID={testID}>
      {pendingPayments.map((p) => (
        <Card key={p.id} variant="flat" padding="sm">
          <View style={styles.row}>
            <Text style={styles.title}>
              {t(`wallet.pending.${p.kind}` as StringKey, { amount: formatMoney(money(p.amountMinor)) })}
            </Text>
            <Badge tone="warning" label="…" size="sm" />
          </View>
        </Card>
      ))}
      {failedPayments.map((p) => (
        <Card key={p.id} variant="flat" padding="sm">
          <View style={styles.row}>
            <Text style={styles.title}>
              {t(`wallet.failed.${p.kind}` as StringKey, { amount: formatMoney(money(p.amountMinor)) })}
            </Text>
            <Badge tone="danger" label="!" size="sm" />
          </View>
        </Card>
      ))}
      {history.map((row) => {
        const title = (row.questId && resolveTitle?.(row.questId)) || row.memo;
        return (
          <Card key={row.txnId} variant="flat" padding="sm" testID={testID ? `${testID}-row-${row.txnId}` : undefined}>
            <View style={styles.row}>
              <View style={styles.textColumn}>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.meta}>
                  {formatStamp(row.at, now)}
                  {row.questId ? ` · ${row.memo}` : ""}
                </Text>
              </View>
              <View style={styles.amountColumn}>
                <Text style={[styles.amount, { color: row.signed && row.amountMinor > 0 ? semantic.color.text.success : semantic.color.text.primary }]}>
                  {(row.signed && row.amountMinor > 0 ? "+" : "") + formatMoney(money(row.amountMinor))}
                </Text>
                <Badge tone={KIND_TONE[row.kind]} size="sm" label={t(`wallet.kind.${row.kind}` as StringKey)} />
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: TITLE_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  meta: {
    fontFamily: META_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
    marginTop: 2,
  },
  amountColumn: {
    alignItems: "flex-end",
    gap: 3,
  },
  amount: {
    fontFamily: AMOUNT_FONT,
    fontSize: raw.fontSize.md,
  },
});
