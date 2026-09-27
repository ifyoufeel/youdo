/* Ports app.js's ConfirmWindow (1180-1195) — a countdown that says what
   happens when it ends, rather than a bare timer: an unconfirmed quest
   pays out, it does not lapse. Purely informational, no action — there's
   no "Confirm and pay" button here or anywhere in M4 (confirmDone needs
   real escrow release, M5's job; this component only ever displays the
   deadline confirmDeadline() computes, never enforces it). */
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";
import { confirmDeadline } from "../../data/domain/lifecycle";
import { formatRemaining } from "../../lib/format";
import type { Quest } from "../../data/contracts";

const HEADLINE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface ConfirmWindowProps {
  quest: Quest;
  now: number;
  doerSide?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ConfirmWindow({ quest, now, doerSide = false, style }: ConfirmWindowProps) {
  const deadline = confirmDeadline(quest);
  const left = deadline ? formatRemaining(deadline, now) : null;

  const subline = doerSide
    ? left
      ? "If nothing is raised, the payment releases to you automatically."
      : "Payment released automatically."
    : left
      ? "After that the payment releases automatically, so nobody is left waiting."
      : "Payment released automatically.";

  return (
    <Card variant="money" padding="md" style={style}>
      <View style={styles.row}>
        <Icon name="clock" size={18} strokeWidth={2} style={styles.icon} />
        <View style={styles.textColumn}>
          <Text style={styles.headline}>{left ? `${left} left to confirm` : "The confirm window has closed"}</Text>
          <Text style={styles.subline}>{subline}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  icon: {
    marginTop: 1,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
  },
  headline: {
    fontFamily: HEADLINE_FONT,
    fontSize: raw.fontSize.sm,
    color: raw.color.ink["900"],
  },
  subline: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize["2xs"],
    lineHeight: raw.fontSize["2xs"] * raw.lineHeight.normal,
    marginTop: 2,
    color: semantic.color.text.primary,
  },
});
