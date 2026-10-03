/* Ports preview/app.js's ErrorState (228-263): written as a fix, not a
   scold — an icon + message row plus a real retry action, on a plain
   (non-sunken) Card. */
import { View, Text, StyleSheet } from "react-native";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { Button } from "./Button";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";
import { t } from "../../i18n/t";

const MESSAGE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  testID?: string;
}

export function ErrorState({ message = t("common.errorGeneric"), onRetry, testID }: ErrorStateProps) {
  return (
    <Card padding="lg" testID={testID}>
      <View style={styles.column}>
        <View style={styles.row}>
          <Icon name="alert-triangle" size={18} color={raw.color.danger["600"]} style={styles.icon} />
          <Text style={styles.message}>{message}</Text>
        </View>
        <Button variant="secondary" size="sm" icon="zap" onPress={onRetry}>
          {t("common.retry")}
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 12,
    alignItems: "flex-start",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  icon: {
    marginTop: 1,
  },
  message: {
    flex: 1,
    fontFamily: MESSAGE_FONT,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: semantic.color.text.primary,
  },
});
