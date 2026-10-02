/* Ports preview/app.js's RateSheet (1305-1337) — a star rating plus an
   optional comment, gated to `rating > 0`. Reset-on-open follows
   CancelSheet.tsx's own "adjust state during render" pattern, not a
   useEffect. */
import { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Dialog } from "@design/components/Dialog";
import { UserChip } from "@design/components/UserChip";
import { Input } from "@design/components/Input";
import { Button } from "@design/components/Button";
import type { User } from "@data/contracts";
import { raw } from "@design/tokens/raw";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { StarPicker } from "./StarPicker";

const WORD_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const RATING_WORD_KEYS = [
  "rateSheet.word.1",
  "rateSheet.word.2",
  "rateSheet.word.3",
  "rateSheet.word.4",
  "rateSheet.word.5",
] as const;

export interface RateSheetProps {
  open: boolean;
  onClose: () => void;
  counterpart: User | null;
  onConfirm: (rating: number, comment: string) => void;
  submitting?: boolean;
}

export function RateSheet({ open, onClose, counterpart, onConfirm, submitting = false }: RateSheetProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setRating(0);
    setComment("");
  } else if (open !== wasOpen) {
    setWasOpen(open);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("rateSheet.title")}
      subtitle={counterpart ? t("rateSheet.subtitle", { name: counterpart.name }) : undefined}
      testID="rate-sheet"
      actions={
        <>
          <Button variant="ghost" onPress={onClose}>
            {t("rateSheet.notNow")}
          </Button>
          <Button
            fullWidth
            disabled={rating === 0 || submitting}
            onPress={() => onConfirm(rating, comment)}
            testID="rate-sheet-confirm"
          >
            {t("rateSheet.submit")}
          </Button>
        </>
      }
    >
      {counterpart ? (
        <UserChip
          name={counterpart.name}
          photoUrl={counterpart.avatarUrl}
          rating={counterpart.rating}
          questsCompleted={counterpart.questsCompleted}
          verified={counterpart.verified}
          size="lg"
        />
      ) : null}
      <View style={styles.pickerColumn}>
        <StarPicker value={rating} onChange={setRating} testID="rate-sheet-stars" />
        <Text style={styles.word}>{rating ? t(RATING_WORD_KEYS[rating - 1]) : t("rateSheet.tapAStar")}</Text>
      </View>
      <Input
        label={t("rateSheet.commentLabel")}
        multiline
        rows={2}
        value={comment}
        onChangeText={setComment}
        placeholder={t("rateSheet.commentPlaceholder")}
        testID="rate-sheet-comment"
      />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  pickerColumn: {
    gap: 8,
    alignItems: "flex-start",
  },
  word: {
    fontFamily: WORD_FONT,
    fontSize: raw.fontSize.sm,
    minHeight: 21,
  },
});
