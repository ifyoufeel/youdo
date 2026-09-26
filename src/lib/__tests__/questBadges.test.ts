import { questBadges } from "../questBadges";
import type { Quest } from "@data/contracts";

const BASE: Quest = {
  id: "q-test",
  posterId: "u1",
  title: "Test quest",
  payoutMinor: 10000,
  payoutUnit: "fixed",
  categoryId: "delivery",
  point: { x: 0, y: 0 },
  estimatedMinutes: 30,
  scheduledFor: "2026-09-16T18:00:00+08:00",
  expiresAt: "2026-09-16T20:00:00+08:00",
  createdAt: "2026-09-16T06:00:00+08:00",
  status: "open",
  acceptedOfferId: null,
  addressLine: "",
  area: "Da'an",
  details: "",
  requirements: [],
};

const HOUR_MS = 60 * 60 * 1000;

describe("questBadges", () => {
  it("shows an 'Ends in' badge within 3 hours of expiry", () => {
    const now = Date.parse(BASE.expiresAt) - 2 * HOUR_MS;
    const badges = questBadges(BASE, now);
    expect(badges).toEqual([{ label: "Ends in 2 hr", tone: "hot", icon: "clock" }]);
  });

  it("shows a 'New' badge for a quest created within the last 3 hours, when not near expiry", () => {
    const now = Date.parse(BASE.createdAt) + HOUR_MS;
    const badges = questBadges(BASE, now);
    expect(badges).toEqual([{ label: "New", tone: "accent" }]);
  });

  it("shows no lifecycle badge once neither condition holds", () => {
    const now = Date.parse(BASE.createdAt) + 10 * HOUR_MS;
    const badges = questBadges(BASE, now);
    expect(badges).toEqual([]);
  });

  it("adds a 'Tools needed' badge when a requirement mentions tools or a drill", () => {
    const now = Date.parse(BASE.createdAt) + 10 * HOUR_MS;
    const withTools: Quest = { ...BASE, requirements: ["Bring a drill"] };
    expect(questBadges(withTools, now)).toEqual([{ label: "Tools needed", tone: "warning", icon: "briefcase" }]);
  });

  it("never shows an 'Ends in' badge once expiry has passed", () => {
    const now = Date.parse(BASE.expiresAt) + HOUR_MS;
    const badges = questBadges(BASE, now);
    expect(badges.find((b) => b.label.startsWith("Ends in"))).toBeUndefined();
  });
});
