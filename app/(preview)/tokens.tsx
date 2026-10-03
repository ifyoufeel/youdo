/* Exit-criterion screen #1 (M0 plan, Phase 7): every color ramp, every
   type.* role, and spacing/shape/motion specimens — proves the generated
   token pipeline (ADR-002) actually resolves at runtime. A tofu glyph or
   a color swatch showing the wrong hex here means Phase 1/2's generator
   or font bundling broke, not that this screen is wrong. */
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { type } from "@design/tokens/type";
import { fontFamilyName } from "@design/tokens/font-family";

const LABEL_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);
const HEADING_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);

function SectionHeading({ children }: { children: string }) {
  return <Text style={styles.sectionHeading}>{children}</Text>;
}

function ColorRamp({ name, ramp }: { name: string; ramp: Record<string, string> }) {
  return (
    <View style={styles.rampBlock}>
      <Text style={styles.rampName}>{name}</Text>
      <View style={styles.rampRow}>
        {Object.entries(ramp).map(([step, hex]) => (
          <View key={step} style={styles.swatchWrap}>
            <View style={[styles.swatch, { backgroundColor: hex }]} />
            <Text style={styles.swatchLabel}>{step}</Text>
            <Text style={styles.swatchLabel}>{hex}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const TYPE_SPECIMENS: { role: keyof typeof type; sample: string }[] = [
  { role: "display", sample: "Walk Biscuit for an hour" },
  { role: "title", sample: "Pick up a parcel" },
  { role: "body", sample: "Biscuit is a very slow beagle who stops at every tree." },
  { role: "label", sample: "POSTED 2H AGO" },
  { role: "caps", sample: "Dog walking" },
  { role: "money", sample: "NT$400" },
];

function TypeSpecimen({ role, sample }: { role: keyof typeof type; sample: string }) {
  const t = type[role];
  return (
    <View style={styles.typeRow}>
      <Text style={styles.typeRoleLabel}>{role}</Text>
      <Text
        style={{
          fontFamily: t.fontFamily,
          fontSize: "fontSize" in t ? t.fontSize : raw.fontSize.md,
          lineHeight: "lineHeight" in t ? t.lineHeight : undefined,
          letterSpacing: "letterSpacing" in t ? t.letterSpacing : undefined,
          fontVariant: "fontVariant" in t ? [...t.fontVariant] : undefined,
          color: semantic.color.text.primary,
        }}
      >
        {sample}
      </Text>
    </View>
  );
}

export default function TokensScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Design tokens</Text>

      <SectionHeading>Color</SectionHeading>
      {Object.entries(raw.color).map(([name, ramp]) => (
        <ColorRamp key={name} name={name} ramp={ramp} />
      ))}

      <SectionHeading>Type</SectionHeading>
      {TYPE_SPECIMENS.map((spec) => (
        <TypeSpecimen key={spec.role} role={spec.role} sample={spec.sample} />
      ))}

      <SectionHeading>Spacing</SectionHeading>
      {Object.entries(raw.space).map(([step, px]) => (
        <View key={step} style={styles.spaceRow}>
          <Text style={styles.spaceLabel}>space.{step}</Text>
          <View style={[styles.spaceBar, { width: Math.max(px, 1) }]} />
          <Text style={styles.spaceLabel}>{px}px</Text>
        </View>
      ))}

      <SectionHeading>Shape</SectionHeading>
      <View style={styles.shapeRow}>
        {Object.entries(raw.radius).map(([name, px]) => (
          <View key={name} style={styles.shapeCell}>
            <View style={[styles.shapeBox, { borderRadius: Math.min(px, 40) }]} />
            <Text style={styles.spaceLabel}>
              {name} ({px})
            </Text>
          </View>
        ))}
      </View>

      <SectionHeading>Motion</SectionHeading>
      <View style={styles.motionBlock}>
        {Object.entries(raw.duration).map(([name, ms]) => (
          <Text key={name} style={styles.motionLine}>
            duration.{name} — {ms}ms
          </Text>
        ))}
        {Object.entries(raw.easing).map(([name, curve]) => (
          <Text key={name} style={styles.motionLine}>
            easing.{name} — cubic-bezier({curve.join(", ")})
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: semantic.color.surface.page,
  },
  content: {
    padding: raw.layout.gutterScreen,
    gap: raw.layout.stackSection,
  },
  title: {
    fontFamily: HEADING_FONT,
    fontSize: raw.fontSize["3xl"],
    color: semantic.color.text.primary,
  },
  sectionHeading: {
    fontFamily: HEADING_FONT,
    fontSize: raw.fontSize.xl,
    color: semantic.color.text.primary,
    marginTop: raw.layout.stackLoose,
  },
  rampBlock: {
    gap: raw.space["2"],
  },
  rampName: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.secondary,
  },
  rampRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: raw.space["2"],
  },
  swatchWrap: {
    alignItems: "center",
    gap: raw.space["05"],
  },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: raw.radius.sm,
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.default,
  },
  swatchLabel: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize["3xs"],
    color: semantic.color.text.muted,
  },
  typeRow: {
    gap: raw.space["1"],
  },
  typeRoleLabel: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.muted,
  },
  spaceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: raw.space["2"],
  },
  spaceLabel: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
    width: 90,
  },
  spaceBar: {
    height: 10,
    backgroundColor: semantic.color.surface.accent,
    borderRadius: raw.radius.xs,
  },
  shapeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: raw.space["4"],
  },
  shapeCell: {
    alignItems: "center",
    gap: raw.space["1"],
    width: 96,
  },
  shapeBox: {
    width: 64,
    height: 64,
    backgroundColor: semantic.color.surface.accent,
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
  },
  motionBlock: {
    gap: raw.space["1"],
  },
  motionLine: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
});
