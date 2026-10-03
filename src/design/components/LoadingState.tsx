/* Ports preview/app.js's LoadingState (183-203): a sunken Card with an
   icon and text — the design system bans skeleton shimmer entirely. */
import { View, Text, StyleSheet } from "react-native";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";
import { t } from "../../i18n/t";

const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface LoadingStateProps {
  label?: string;
  testID?: string;
}

export function LoadingState({ label = t("common.loading"), testID }: LoadingStateProps) {
  return (
    <Card variant="sunken" padding="lg" testID={testID}>
      <View style={styles.row}>
        <Icon name="clock" size={17} color={raw.color.ink["400"]} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.secondary,
  },
});
