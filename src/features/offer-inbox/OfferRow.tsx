/* Ports app.js's OfferRow (1340-1372). One divergence: the web version's
   RewardPill takes a `tone` prop ("quiet" vs "money") to color the pill
   itself by whether the offer is above or below asking — this port's
   RewardPill has no tone variant (nothing else needed one yet), so the
   delta stays a separate small mono label under the pill instead, same
   information, one less new prop on a shared primitive for a single
   consumer. `onMessage` stays optional and unwired until M4 Phase 5
   (Chats) gives it a real thread route to open — per this codebase's "no
   dead buttons" discipline, omitting it here isn't a shortcut, it's the
   same conditional-render the web version itself does. */
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@design/components/Card";
import { UserChip } from "@design/components/UserChip";
import { RewardPill } from "@design/components/RewardPill";
import { Button } from "@design/components/Button";
import { money, formatMoney, type Offer, type User } from "@data/contracts";
import { formatStamp } from "@lib/format";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";

const NOTE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const STAMP_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);
const DELTA_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);

export interface OfferRowProps {
  offer: Offer;
  doer: User | null;
  askingPriceMinor: number;
  now: number;
  onAccept: () => void;
  onDecline: () => void;
  onMessage?: () => void;
  testID?: string;
}

export function OfferRow({ offer, doer, askingPriceMinor, now, onAccept, onDecline, onMessage, testID }: OfferRowProps) {
  const delta = offer.amountMinor - askingPriceMinor;

  return (
    <Card padding="md" testID={testID}>
      <View style={styles.headerRow}>
        {doer ? (
          <UserChip
            name={doer.name}
            photoUrl={doer.avatarUrl}
            rating={doer.rating}
            questsCompleted={doer.questsCompleted}
            verified={doer.verified}
            style={styles.userChip}
          />
        ) : (
          <View style={styles.userChip} />
        )}
        <View style={styles.amountColumn}>
          <RewardPill amount={formatMoney(money(offer.amountMinor))} />
          {delta !== 0 ? (
            <Text style={styles.delta}>
              {delta > 0 ? "+" : "−"}
              {formatMoney(money(Math.abs(delta)))} {t("offerInbox.vsAsking")}
            </Text>
          ) : null}
        </View>
      </View>

      {offer.note ? <Text style={styles.note}>{offer.note}</Text> : null}

      <View style={styles.stampRow}>
        <Text style={styles.stamp}>{formatStamp(offer.createdAt, now)}</Text>
        {onMessage ? (
          <Button size="sm" variant="ghost" icon="message-circle" onPress={onMessage}>
            {t("offerInbox.openChat")}
          </Button>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        <Button size="sm" variant="secondary" fullWidth onPress={onDecline} testID={testID ? `${testID}-decline` : undefined}>
          {t("offerInbox.decline")}
        </Button>
        <Button size="sm" variant="primary" icon="check" fullWidth onPress={onAccept} testID={testID ? `${testID}-accept` : undefined}>
          {t("offerInbox.accept")}
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  userChip: {
    flex: 1,
    minWidth: 0,
  },
  amountColumn: {
    alignItems: "flex-end",
    gap: 4,
  },
  delta: {
    fontFamily: DELTA_FONT,
    fontSize: raw.fontSize["3xs"],
    color: raw.color.ink["400"],
  },
  note: {
    marginTop: 10,
    fontFamily: NOTE_FONT,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: raw.color.ink["700"],
  },
  stampRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  stamp: {
    flex: 1,
    minWidth: 0,
    fontFamily: STAMP_FONT,
    fontSize: raw.fontSize["3xs"],
    color: raw.color.ink["400"],
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: raw.border.hair,
    borderTopColor: semantic.color.border.subtle,
  },
});
