/* Promoted out of UserChip.tsx (ds-bundle.js:113-187) now that a second
   consumer needs a bare avatar with no name/rating/meta alongside it —
   OfferRow's decided-offers list and ThreadScreen's message bubbles (M4),
   same "promote once a second consumer needs it" threshold this codebase
   already applied to Badge/RewardPill/UserChip (M2) and InfoRow (M3).
   UserChip imports this back for its own use, so its own rendering is
   unchanged. No `src`/photo support — there's no image/asset pipeline yet,
   so this is always the initials-circle path. */
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "./Icon";
import { raw } from "../tokens/raw";
import { semantic } from "../tokens/semantic";
import { fontFamilyName } from "../tokens/font-family";

const INITIALS_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);

export type AvatarSize = "sm" | "md" | "lg";

const AVATAR_SIZES: Record<AvatarSize, number> = { sm: 32, md: 40, lg: 56 };
const TINTS = [raw.color.lime["300"], raw.color.coin["300"], raw.color.flare["300"], raw.color.info["200"], raw.color.success["200"]];

function initialsFor(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function tintFor(name: string): string {
  return TINTS[(name.charCodeAt(0) || 0) % TINTS.length];
}

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  verified?: boolean;
  testID?: string;
}

export function Avatar({ name, size = "md", verified = false, testID }: AvatarProps) {
  const d = AVATAR_SIZES[size];
  const badgeSize = Math.max(14, Math.round(d * 0.34));
  return (
    <View style={{ width: d, height: d }} testID={testID}>
      <View
        style={[
          styles.avatarCircle,
          { width: d, height: d, borderRadius: raw.radius.avatar, backgroundColor: tintFor(name) },
        ]}
      >
        <Text style={[styles.initials, { fontSize: Math.round(d * 0.38) }]}>{initialsFor(name)}</Text>
      </View>
      {verified ? (
        <View
          style={[
            styles.verifiedBadge,
            { width: badgeSize, height: badgeSize, borderRadius: raw.radius.pill },
          ]}
        >
          <Icon name="check" size={Math.max(8, Math.round(d * 0.2))} strokeWidth={2.25} color={raw.color.ink["900"]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarCircle: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
    overflow: "hidden",
  },
  initials: {
    fontFamily: INITIALS_FONT,
    letterSpacing: -0.02,
    color: raw.color.ink["900"],
  },
  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: raw.color.lime["500"],
    borderWidth: raw.border.width,
    borderColor: semantic.color.border.strong,
  },
});
