/* Promoted from QuestDetailScreen.tsx's private InfoRow now that a
   second consumer (M3's wizard Review step and FeeBreakdown) needs the
   same label/value row — same "promote once a second thing needs it"
   move as Badge/RewardPill/UserChip in M2 Phase 1. Deliberately keeps
   QuestDetailScreen's own no-border shape rather than ds-bundle.js's
   bordered version: Card.tsx already spaces its children via
   raw.layout.cardGap, so a per-row border would double up the
   separation. `tone`/`last` from the prototype's version are dropped too
   — neither is ever actually passed at any real call site. */
import { View, Text, StyleSheet } from "react-native";
import { Icon, type IconName } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const VALUE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface InfoRowProps {
  icon?: IconName;
  label: string;
  value: string;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.labelGroup}>
        {icon ? <Icon name={icon} size={14} color={raw.color.ink["400"]} /> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.secondary,
  },
  value: {
    fontFamily: VALUE_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
});
