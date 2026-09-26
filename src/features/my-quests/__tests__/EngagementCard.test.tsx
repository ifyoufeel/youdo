import { render, fireEvent } from "@testing-library/react-native";
import { EngagementCard } from "../EngagementCard";
import type { Quest, User } from "@data/contracts";

const QUEST: Quest = {
  id: "q1",
  posterId: "u1",
  title: "Walk Biscuit for an hour",
  payoutMinor: 40000,
  payoutUnit: "fixed",
  categoryId: "dog-walking",
  point: { x: 0, y: 0 },
  estimatedMinutes: 60,
  durationLabel: null,
  scheduledFor: "2026-09-16T18:00:00+08:00",
  expiresAt: "2026-09-16T17:00:00+08:00",
  createdAt: "2026-09-15T20:10:00+08:00",
  status: "in_progress",
  acceptedOfferId: "o1",
  addressLine: "14B, Lane 31, Yongkang St",
  area: "Da'an",
  details: "",
  requirements: [],
};

const POSTER: User = {
  id: "u1",
  name: "Wei-Ting C.",
  rating: 4.9,
  questsCompleted: 38,
  verified: true,
  area: "Da'an",
  home: { x: 0, y: 0 },
  cancelRate: 0.02,
  bio: "",
  phone: "",
  email: "",
  bank: "",
  joined: "2025-11-04T10:00:00+08:00",
};

const NOW = Date.parse("2026-09-16T09:00:00+08:00");

describe("EngagementCard", () => {
  it("renders with no console warnings/errors, with and without a counterpart", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(
      <EngagementCard
        quest={QUEST}
        role="doer"
        amountMinor={40000}
        counterpart={POSTER}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
      />
    );
    await render(
      <EngagementCard
        quest={QUEST}
        role="poster"
        amountMinor={40000}
        counterpart={null}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
      />
    );
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the role badge and title", async () => {
    const { getByText } = await render(
      <EngagementCard
        quest={QUEST}
        role="doer"
        amountMinor={40000}
        counterpart={POSTER}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
      />
    );
    expect(getByText("Taken by you")).toBeTruthy();
    expect(getByText("Walk Biscuit for an hour")).toBeTruthy();
  });

  it("shows the poster's own 'Posted by you' label", async () => {
    const { getByText } = await render(
      <EngagementCard
        quest={QUEST}
        role="poster"
        amountMinor={40000}
        counterpart={null}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
      />
    );
    expect(getByText("Posted by you")).toBeTruthy();
  });

  it("shows the counterpart's UserChip when one is given", async () => {
    const { getByText } = await render(
      <EngagementCard
        quest={QUEST}
        role="doer"
        amountMinor={40000}
        counterpart={POSTER}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
      />
    );
    expect(getByText("Wei-Ting C.")).toBeTruthy();
  });

  it("falls back to 'offers close in' text when there's no counterpart and offers are still open", async () => {
    const openQuest = { ...QUEST, status: "open" as const, acceptedOfferId: null, expiresAt: "2026-09-16T15:00:00+08:00" };
    const { getByText } = await render(
      <EngagementCard
        quest={openQuest}
        role="applicant"
        amountMinor={40000}
        counterpart={null}
        pendingOfferCount={2}
        now={NOW}
        onOpen={() => {}}
      />
    );
    expect(getByText(/Offers close in/)).toBeTruthy();
  });

  it("falls back to 'no offers came in' once expired with none pending", async () => {
    const expiredQuest = { ...QUEST, status: "expired" as const, acceptedOfferId: null, expiresAt: "2026-09-15T15:00:00+08:00" };
    const { getByText } = await render(
      <EngagementCard
        quest={expiredQuest}
        role="poster"
        amountMinor={40000}
        counterpart={null}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
      />
    );
    expect(getByText("No offers came in")).toBeTruthy();
  });

  it("falls back to 'offers have closed' once expired with some pending", async () => {
    const expiredQuest = { ...QUEST, status: "expired" as const, acceptedOfferId: null, expiresAt: "2026-09-15T15:00:00+08:00" };
    const { getByText } = await render(
      <EngagementCard
        quest={expiredQuest}
        role="poster"
        amountMinor={40000}
        counterpart={null}
        pendingOfferCount={1}
        now={NOW}
        onOpen={() => {}}
      />
    );
    expect(getByText("Offers have closed")).toBeTruthy();
  });

  it("calls onOpen when View is pressed", async () => {
    const onOpen = jest.fn();
    const { getByTestId } = await render(
      <EngagementCard
        quest={QUEST}
        role="doer"
        amountMinor={40000}
        counterpart={POSTER}
        pendingOfferCount={0}
        now={NOW}
        onOpen={onOpen}
      />
    );
    await fireEvent.press(getByTestId("engagement-view"));
    expect(onOpen).toHaveBeenCalled();
  });
});
