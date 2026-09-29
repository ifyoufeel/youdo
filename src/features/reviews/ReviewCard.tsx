/* One "What people said" row — promoted out of PublicProfileScreen now
   that ProfileScreen (M6 Phase 5) needs the identical card for the
   signed-in user's own reviews. Both screens already share the same
   reveal-gated read (listReviewsForUser) and the same usePosters-based
   rater resolution; only the section wrapper (empty-state copy, whether
   the section hides entirely when empty) differs between them, so that
   stays screen-local. */
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@design/components/Card";
import { Avatar } from "@design/components/Avatar";
import { Badge } from "@design/components/Badge";
import type { Review } from "@data/contracts";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";

const RATER_NAME_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const COMMENT_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export interface ReviewCardProps {
  review: Review;
  raterName: string | undefined;
}

export function ReviewCard({ review, raterName }: ReviewCardProps) {
  return (
    <Card variant="sunken" padding="md">
      <View style={styles.row}>
        <Avatar name={raterName ?? "?"} size="sm" />
        <Text style={styles.name}>{raterName ?? "—"}</Text>
        <Badge label={String(review.rating)} tone="money" icon="star" size="sm" />
      </View>
      {review.comment ? <Text style={styles.comment}>{review.comment}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: RATER_NAME_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  comment: {
    fontFamily: COMMENT_FONT,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: raw.color.ink["700"],
    marginTop: 8,
  },
});
