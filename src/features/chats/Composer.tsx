/* Ports the composer row from app.js's ThreadScreen (3175-3193) — Enter
   (no shift) sends on web via Input's onSubmitEditing, the send
   IconButton always works everywhere. */
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Input } from "@design/components/Input";
import { IconButton } from "@design/components/IconButton";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { t } from "../../i18n/t";

export interface ComposerProps {
  onSend: (body: string) => void;
  sending?: boolean;
}

export function Composer({ onSend, sending = false }: ComposerProps) {
  const [draft, setDraft] = useState("");

  function submit() {
    const body = draft.trim();
    if (!body || sending) return;
    onSend(body);
    setDraft("");
  }

  return (
    <View style={styles.row}>
      <View style={styles.inputWrap}>
        <Input value={draft} onChangeText={setDraft} placeholder={t("thread.composerPlaceholder")} onSubmitEditing={submit} testID="thread-composer" />
      </View>
      <IconButton icon="send" accessibilityLabel={t("thread.send")} variant="primary" disabled={!draft.trim() || sending} onPress={submit} testID="thread-send" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: raw.layout.gutterScreen,
    paddingVertical: 10,
    backgroundColor: semantic.color.surface.card,
    borderTopWidth: raw.border.width,
    borderTopColor: semantic.color.border.strong,
  },
  inputWrap: {
    flex: 1,
    minWidth: 0,
  },
});
