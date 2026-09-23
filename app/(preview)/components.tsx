/* Exit-criterion screen #2 (M0 plan, Phase 7): Icon (all 47), Button
   (every variant x size, genuinely pressable — not static "pressed"
   screenshots, since Sticker's press feedback is exactly what this
   milestone is proving survives the port), Card (every variant, one with
   `media` to exercise ADR-003's overflow-clipping watch item), and
   Sticker standalone. */
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Icon } from "@design/components/Icon";
import { ICON_NAMES } from "@design/icons/names";
import { Button, type ButtonVariant, type ButtonSize } from "@design/components/Button";
import { Card, type CardVariant } from "@design/components/Card";
import { Sticker } from "@design/components/Sticker";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";

const HEADING_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const LABEL_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);
const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

function SectionHeading({ children }: { children: string }) {
  return <Text style={styles.sectionHeading}>{children}</Text>;
}

const BUTTON_VARIANTS: ButtonVariant[] = ["primary", "secondary", "inverse", "money", "danger", "ghost"];
const BUTTON_SIZES: ButtonSize[] = ["sm", "md", "lg"];
const CARD_VARIANTS: CardVariant[] = ["sticker", "flat", "sunken", "accent", "money", "inverse"];

export default function ComponentsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Component gallery</Text>

      <SectionHeading>Icon — all 47</SectionHeading>
      <View style={styles.iconGrid}>
        {ICON_NAMES.map((name) => (
          <View key={name} style={styles.iconCell}>
            <Icon name={name} size={22} />
            <Text style={styles.iconLabel}>{name}</Text>
          </View>
        ))}
      </View>

      <SectionHeading>Button — variant x size (press one)</SectionHeading>
      <View style={styles.buttonGrid}>
        {BUTTON_VARIANTS.map((variant) => (
          <View key={variant} style={styles.buttonRow}>
            <Text style={styles.rowLabel}>{variant}</Text>
            {BUTTON_SIZES.map((size) => (
              <Button key={size} variant={variant} size={size} icon="check" onPress={() => {}}>
                {size}
              </Button>
            ))}
          </View>
        ))}
      </View>

      <SectionHeading>Card — every variant</SectionHeading>
      <View style={styles.cardGrid}>
        {CARD_VARIANTS.map((variant) => (
          <Card key={variant} variant={variant} interactive onPress={() => {}} style={styles.cardCell}>
            <Text style={styles.cardTitle}>{variant}</Text>
            <Text style={styles.cardBody}>Walk Biscuit for an hour — NT$400</Text>
          </Card>
        ))}
        {/* The one card exercising ADR-003's overflow-clipping watch item:
            a media block whose own inner View clips, while Sticker's
            shadow sibling — rendered outside this box entirely — stays
            unclippable. */}
        <Card
          variant="sticker"
          interactive
          onPress={() => {}}
          style={styles.cardCell}
          media={<View style={styles.mediaBlock} />}
        >
          <Text style={styles.cardTitle}>with media</Text>
          <Text style={styles.cardBody}>Pick up a parcel</Text>
        </Card>
      </View>

      <SectionHeading>Sticker — standalone</SectionHeading>
      <View style={styles.stickerRow}>
        <Sticker radius={raw.radius.md} interactive={false}>
          <View style={[styles.stickerFill, { backgroundColor: semantic.color.surface.accent }]} />
        </Sticker>
        <Sticker radius={raw.radius.md} interactive onPress={() => {}}>
          <View style={[styles.stickerFill, { backgroundColor: semantic.color.surface.money }]} />
        </Sticker>
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
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: raw.space["4"],
  },
  iconCell: {
    alignItems: "center",
    gap: raw.space["1"],
    width: 72,
  },
  iconLabel: {
    fontFamily: LABEL_FONT,
    fontSize: 9,
    color: semantic.color.text.muted,
    textAlign: "center",
  },
  buttonGrid: {
    gap: raw.layout.stackDefault,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: raw.space["3"],
  },
  rowLabel: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
    width: 70,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: raw.layout.stackDefault,
  },
  cardCell: {
    width: 220,
  },
  cardTitle: {
    fontFamily: fontFamilyName(raw.font.text, raw.fontWeight.semibold),
    fontSize: raw.fontSize.sm,
  },
  cardBody: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
  },
  mediaBlock: {
    height: 96,
    backgroundColor: semantic.color.surface.hotSoft,
  },
  stickerRow: {
    flexDirection: "row",
    gap: raw.layout.stackDefault,
  },
  stickerFill: {
    width: 96,
    height: 96,
    borderRadius: raw.radius.md,
  },
});
