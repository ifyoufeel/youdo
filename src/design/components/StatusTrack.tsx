/* Ports ds-bundle.js's StatusTrack (1380-1503) — 3 checkpoints once a
   quest is live ("Posted"/open isn't one of them, hence current can be
   -1). Once paid there's nothing left in progress to track, so the
   3-marker row collapses into a single "Paid ---- (check)" line at the
   same 26px row height, exactly as the web version does.

   The web version's absolute+percentage-transform label centering has no
   RN equivalent (percentage transforms aren't supported the way CSS
   supports them) — ported instead as a fixed-height (26, matching the
   circles) row where the connecting line is an absolutely-positioned,
   offset-free child of a centered flex container: RN's Yoga layout (like
   CSS) centers an abspos child with no inset properties via the parent's
   alignItems, the same "static position" behavior the web version reaches
   via percentages. current always comes from statusMeta(quest.status).track,
   never computed locally by a caller. */
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const LABEL_FONT_BOLD = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const LABEL_FONT_MEDIUM = fontFamilyName(raw.font.text, raw.fontWeight.medium);

const STEPS = ["Accepted", "Doing", "Paid"] as const;
const ROW_HEIGHT = 26;

export interface StatusTrackProps {
  /** -1 = nothing reached yet; 0/1/2 = which of STEPS is current.
      Always statusMeta(quest.status).track — never computed by a caller. */
  current: -1 | 0 | 1 | 2;
  style?: StyleProp<ViewStyle>;
}

export function StatusTrack({ current, style }: StatusTrackProps) {
  const lastIndex = STEPS.length - 1;
  const paidDone = current >= lastIndex;

  if (paidDone) {
    return (
      <View style={[styles.row, style]}>
        <Text style={styles.paidLabel}>Paid</Text>
        <View style={styles.paidLine} />
        <View style={styles.paidCircle}>
          <Icon name="check" size={13} strokeWidth={3} color={raw.color.ink["900"]} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, style]}>
      {STEPS.map((label, i) => {
        const done = i <= current;
        const isLast = i === lastIndex;
        return (
          <View key={label} style={styles.stepGroup}>
            <View style={[styles.circle, done ? styles.circleDone : styles.circlePending]}>
              {done ? <Icon name="check" size={13} strokeWidth={3} color={raw.color.paper["050"]} /> : null}
            </View>
            {!isLast ? (
              <View style={styles.lineContainer}>
                <View style={[styles.lineBar, { backgroundColor: i + 1 <= current ? raw.color.ink["900"] : raw.color.ink["200"] }]} />
                <Text style={[styles.lineLabel, done ? styles.lineLabelDone : styles.lineLabelPending]}>{label}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: ROW_HEIGHT,
  },
  stepGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  circle: {
    width: ROW_HEIGHT,
    height: ROW_HEIGHT,
    borderRadius: raw.radius.pill,
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  circleDone: {
    backgroundColor: raw.color.ink["900"],
  },
  circlePending: {
    backgroundColor: raw.color.paper["000"],
  },
  lineContainer: {
    width: 56,
    height: ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  lineBar: {
    position: "absolute",
    left: 0,
    right: 0,
    height: raw.border.width,
  },
  lineLabel: {
    fontFamily: LABEL_FONT_MEDIUM,
    fontSize: raw.fontSize["3xs"],
    backgroundColor: semantic.color.surface.card,
    paddingHorizontal: 6,
  },
  lineLabelDone: {
    fontFamily: LABEL_FONT_BOLD,
    color: raw.color.ink["900"],
  },
  lineLabelPending: {
    color: raw.color.ink["400"],
  },
  paidLabel: {
    fontFamily: LABEL_FONT_BOLD,
    fontSize: raw.fontSize["3xs"],
    color: raw.color.ink["900"],
    marginRight: 8,
    flexShrink: 0,
  },
  paidLine: {
    flex: 1,
    height: raw.border.width,
    backgroundColor: raw.color.ink["900"],
  },
  paidCircle: {
    width: ROW_HEIGHT,
    height: ROW_HEIGHT,
    marginLeft: 8,
    borderRadius: raw.radius.pill,
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    backgroundColor: raw.color.coin["500"],
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
