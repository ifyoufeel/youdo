/* Non-route helper (leading underscore — skipped by Expo Router). The
   ADR-008/009 dev-only strip: actor switcher, movable clock, and the
   repository fault-injection switch. Rendered only behind __DEV__ by
   (preview)/_layout.tsx — this file itself doesn't re-check that, its
   caller is the one gate. */
import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Button } from "@design/components/Button";
import { useRepository, getFaultInjectionRate, setFaultInjectionRate } from "@data/composition-root";
import type { User } from "@data/contracts";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { usePreviewControls } from "./PreviewControls";

const LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const CHIP_FONT = fontFamilyName(raw.font.text, raw.fontWeight.semibold);
const MONO_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);

const HOUR_MS = 60 * 60 * 1000;

function ActorSwitcher() {
  const repository = useRepository();
  const { actorId, setActorId } = usePreviewControls();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let cancelled = false;
    repository.listUsers({ limit: 6 }).then((page) => {
      if (!cancelled) setUsers(page.items);
    });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>Actor</Text>
      {users.map((u) => (
        <Pressable
          key={u.id}
          onPress={() => setActorId(u.id)}
          style={[styles.chip, actorId === u.id && styles.chipActive]}
        >
          <Text style={[styles.chipText, actorId === u.id && styles.chipTextActive]}>{u.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ClockControl() {
  const { now, advanceClock } = usePreviewControls();

  return (
    <View style={styles.row}>
      <Text style={styles.label}>Clock</Text>
      <Text style={styles.now}>{new Date(now).toLocaleString()}</Text>
      <Button size="sm" variant="ghost" onPress={() => advanceClock(HOUR_MS)}>
        +1h
      </Button>
      <Button size="sm" variant="ghost" onPress={() => advanceClock(HOUR_MS * 24)}>
        +1d
      </Button>
      <Button size="sm" variant="ghost" onPress={() => advanceClock(HOUR_MS * 24 * 3)}>
        +3d
      </Button>
    </View>
  );
}

function FaultInjectionSwitch() {
  const [on, setOn] = useState(() => getFaultInjectionRate() > 0);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>Faults</Text>
      <Pressable
        onPress={() => {
          const next = !on;
          setFaultInjectionRate(next ? 1 : 0);
          setOn(next);
        }}
        style={[styles.chip, on && styles.chipDanger]}
      >
        <Text style={[styles.chipText, on && styles.chipTextActive]}>{on ? "Injecting" : "Off"}</Text>
      </Pressable>
    </View>
  );
}

export function DevStrip() {
  return (
    <View style={styles.strip}>
      <ActorSwitcher />
      <ClockControl />
      <FaultInjectionSwitch />
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: raw.space["4"],
    paddingHorizontal: raw.layout.gutterScreen,
    paddingVertical: raw.space["2"],
    backgroundColor: semantic.color.surface.sunken,
    borderBottomWidth: raw.border.hair,
    borderBottomColor: semantic.color.border.default,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: raw.space["1"],
  },
  label: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.muted,
    marginRight: raw.space["1"],
  },
  now: {
    fontFamily: MONO_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
    marginRight: raw.space["1"],
  },
  chip: {
    paddingHorizontal: raw.space["2"],
    paddingVertical: raw.space["05"],
    borderRadius: raw.radius.pill,
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.default,
    backgroundColor: semantic.color.surface.card,
  },
  chipActive: {
    backgroundColor: semantic.color.surface.accent,
    borderColor: semantic.color.border.strong,
  },
  chipDanger: {
    backgroundColor: semantic.color.surface.hot,
    borderColor: semantic.color.border.strong,
  },
  chipText: {
    fontFamily: CHIP_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  chipTextActive: {
    color: semantic.color.text.primary,
  },
});
