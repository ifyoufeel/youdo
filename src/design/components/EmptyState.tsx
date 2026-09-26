/* Ports preview/app.js's EmptyState (205-227): names the next action,
   never just reports emptiness — `action`/`onAction` are optional, but
   when given they render a real button, not a dead end. */
import { View, Text, StyleSheet } from "react-native";
import { Card } from "./Card";
import { Button } from "./Button";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const TITLE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);

export interface EmptyStateProps {
  title: string;
  action?: string;
  onAction?: () => void;
  testID?: string;
}

export function EmptyState({ title, action, onAction, testID }: EmptyStateProps) {
  return (
    <Card variant="sunken" padding="lg" testID={testID}>
      <View style={styles.column}>
        <Text style={styles.title}>{title}</Text>
        {action ? (
          <Button variant="secondary" size="sm" onPress={onAction}>
            {action}
          </Button>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 12,
    alignItems: "flex-start",
  },
  title: {
    fontFamily: TITLE_FONT,
    fontSize: raw.fontSize.md,
    color: semantic.color.text.primary,
  },
});
