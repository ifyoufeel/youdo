/* Ports preview/app.js's ProfileScreen balance block (3383-3409) as its
   own component. Feature-local rather than a design-system primitive —
   same "promote once a second consumer needs it" call M1-M4 made
   repeatedly, just applied at the feature-folder level: DepositSheet
   (this same folder) gets a second real consumer once M5 Phase 7 wires a
   shortfall row into the offer inbox, but nothing outside `wallet`/
   `profile` needs WalletCard itself. Purely presentational — the parent
   owns navigation to the deposit/cash-out sheets. */
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@design/components/Card";
import { Badge } from "@design/components/Badge";
import { Button } from "@design/components/Button";
import { money, formatMoney } from "@data/contracts";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";

const EYEBROW_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const HEADLINE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.black);

export interface WalletCardProps {
  availableMinor: number;
  heldMinor: number;
  incomingMinor: number;
  onAddMoney: () => void;
  onCashOut: () => void;
  testID?: string;
}

export function WalletCard({ availableMinor, heldMinor, incomingMinor, onAddMoney, onCashOut, testID }: WalletCardProps) {
  return (
    <Card padding="lg" testID={testID}>
      <Text style={styles.eyebrow}>{t("wallet.available")}</Text>
      <Text style={styles.headline}>{formatMoney(money(availableMinor))}</Text>
      <View style={styles.badges}>
        {heldMinor > 0 ? (
          <Badge tone="warning" icon="lock" label={t("wallet.held", { amount: formatMoney(money(heldMinor)) })} />
        ) : null}
        {incomingMinor > 0 ? (
          <Badge tone="success" icon="coins" label={t("wallet.incoming", { amount: formatMoney(money(incomingMinor)) })} />
        ) : null}
        {heldMinor <= 0 && incomingMinor <= 0 ? <Badge label={t("wallet.nothingHeld")} /> : null}
      </View>
      <View style={styles.actions}>
        {/* Button's `fullWidth` is a literal width:100% of its own
            immediate parent, not flex:1 of the row (Button.tsx) — two
            fullWidth buttons side by side in one row would both claim
            100% of the ROW and overflow (every existing two-button row
            elsewhere sidesteps this by pairing one fullWidth button with
            one plain-sized one). Wrapping each in its own flex:1 slot
            gives fullWidth a narrower parent to fill instead, without
            touching Button's shared style — a change there would ripple
            into every other consumer. */}
        <View style={styles.actionSlot}>
          <Button variant="money" icon="plus" fullWidth onPress={onAddMoney} testID={testID ? `${testID}-add` : undefined}>
            {t("wallet.addMoney")}
          </Button>
        </View>
        <View style={styles.actionSlot}>
          <Button
            variant="secondary"
            icon="wallet"
            fullWidth
            disabled={availableMinor <= 0}
            onPress={onCashOut}
            testID={testID ? `${testID}-cash-out` : undefined}
          >
            {t("wallet.cashOut")}
          </Button>
        </View>
      </View>
    </Card>
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
  headline: {
    fontFamily: HEADLINE_FONT,
    fontSize: raw.fontSize["4xl"],
    letterSpacing: raw.letterSpacing.display,
    color: semantic.color.text.primary,
    marginTop: 4,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  actionSlot: {
    flex: 1,
  },
});
