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

  it("shows a Review offers button only for the poster on an open quest with onReviewOffers given", async () => {
    const openQuest = { ...QUEST, status: "open" as const, acceptedOfferId: null };
    const { getByText } = await render(
      <EngagementCard
        quest={openQuest}
        role="poster"
        amountMinor={40000}
        counterpart={null}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
        onReviewOffers={() => {}}
      />
    );
    expect(getByText("Review offers")).toBeTruthy();
  });

  it("shows the pending count in the Review offers label once there are some", async () => {
    const openQuest = { ...QUEST, status: "open" as const, acceptedOfferId: null };
    const { getByText } = await render(
      <EngagementCard
        quest={openQuest}
        role="poster"
        amountMinor={40000}
        counterpart={null}
        pendingOfferCount={3}
        now={NOW}
        onOpen={() => {}}
        onReviewOffers={() => {}}
      />
    );
    expect(getByText("Review 3 offers")).toBeTruthy();
  });

  it("never shows Review offers without onReviewOffers, even for the poster on an open quest", async () => {
    const openQuest = { ...QUEST, status: "open" as const, acceptedOfferId: null };
    const { queryByText } = await render(
      <EngagementCard
        quest={openQuest}
        role="poster"
        amountMinor={40000}
        counterpart={null}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
      />
    );
    expect(queryByText(/Review/)).toBeNull();
  });

  it("never shows Review offers for a non-poster role or a non-open quest", async () => {
    const { queryByText: q1 } = await render(
      <EngagementCard
        quest={QUEST}
        role="doer"
        amountMinor={40000}
        counterpart={POSTER}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
        onReviewOffers={() => {}}
      />
    );
    expect(q1(/Review/)).toBeNull();

    const { queryByText: q2 } = await render(
      <EngagementCard
        quest={QUEST}
        role="poster"
        amountMinor={40000}
        counterpart={null}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
        onReviewOffers={() => {}}
      />
    );
    expect(q2(/Review/)).toBeNull(); // QUEST is in_progress, not open
  });

  it("calls onReviewOffers when Review offers is pressed", async () => {
    const openQuest = { ...QUEST, status: "open" as const, acceptedOfferId: null };
    const onReviewOffers = jest.fn();
    const { getByTestId } = await render(
      <EngagementCard
        quest={openQuest}
        role="poster"
        amountMinor={40000}
        counterpart={null}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
        onReviewOffers={onReviewOffers}
      />
    );
    await fireEvent.press(getByTestId("engagement-review-offers"));
    expect(onReviewOffers).toHaveBeenCalled();
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

  it("shows StatusTrack whenever the status has a track position, hides it when it doesn't", async () => {
    // QUEST is in_progress — track 1 ("Doing"). "Doing" legitimately
    // appears twice once StatusTrack renders: once in the status Badge,
    // once in StatusTrack's own line label.
    const { getAllByText } = await render(
      <EngagementCard quest={QUEST} role="doer" amountMinor={40000} counterpart={POSTER} pendingOfferCount={0} now={NOW} onOpen={() => {}} />
    );
    expect(getAllByText("Doing")).toHaveLength(2);

    const openQuest = { ...QUEST, status: "open" as const, acceptedOfferId: null }; // track -1
    const { getAllByText: getAllOpen } = await render(
      <EngagementCard quest={openQuest} role="poster" amountMinor={40000} counterpart={null} pendingOfferCount={0} now={NOW} onOpen={() => {}} />
    );
    expect(getAllOpen("Open")).toHaveLength(1); // just the status Badge — StatusTrack renders nothing
  });

  it("shows ConfirmWindow only once completed", async () => {
    const completedQuest = { ...QUEST, status: "completed" as const, completedAt: "2026-09-16T08:00:00+08:00" };
    const { getByText } = await render(
      <EngagementCard quest={completedQuest} role="doer" amountMinor={40000} counterpart={POSTER} pendingOfferCount={0} now={NOW} onOpen={() => {}} />
    );
    expect(getByText(/left to confirm|confirm window has closed/)).toBeTruthy();

    const { queryByText } = await render(
      // QUEST is in_progress, not completed.
      <EngagementCard quest={QUEST} role="doer" amountMinor={40000} counterpart={POSTER} pendingOfferCount={0} now={NOW} onOpen={() => {}} />
    );
    expect(queryByText(/left to confirm|confirm window has closed/)).toBeNull();
  });

  it("shows Start quest only for the accepted doer once assigned, and calls onStartQuest", async () => {
    const assignedQuest = { ...QUEST, status: "assigned" as const };
    const onStartQuest = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <EngagementCard
        quest={assignedQuest}
        role="doer"
        amountMinor={40000}
        counterpart={POSTER}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
        onStartQuest={onStartQuest}
      />
    );
    expect(queryByTestId("engagement-mark-as-done")).toBeNull();
    await fireEvent.press(getByTestId("engagement-start-quest"));
    expect(onStartQuest).toHaveBeenCalled();
  });

  it("shows Mark as done only for the accepted doer once in_progress, and calls onMarkAsDone", async () => {
    const onMarkAsDone = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      // QUEST is already in_progress.
      <EngagementCard
        quest={QUEST}
        role="doer"
        amountMinor={40000}
        counterpart={POSTER}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
        onMarkAsDone={onMarkAsDone}
      />
    );
    expect(queryByTestId("engagement-start-quest")).toBeNull();
    await fireEvent.press(getByTestId("engagement-mark-as-done"));
    expect(onMarkAsDone).toHaveBeenCalled();
  });

  it("never shows Start quest/Mark as done for a poster or applicant, even with both handlers given", async () => {
    const assignedQuest = { ...QUEST, status: "assigned" as const };
    const { queryByTestId } = await render(
      <EngagementCard
        quest={assignedQuest}
        role="poster"
        amountMinor={40000}
        counterpart={POSTER}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
        onStartQuest={() => {}}
        onMarkAsDone={() => {}}
      />
    );
    expect(queryByTestId("engagement-start-quest")).toBeNull();
    expect(queryByTestId("engagement-mark-as-done")).toBeNull();
  });

  it("shows Confirm and pay only for the poster once completed, and calls onConfirmDone", async () => {
    const completedQuest = { ...QUEST, status: "completed" as const, completedAt: "2026-09-16T08:00:00+08:00" };
    const onConfirmDone = jest.fn();
    const { getByTestId, getByText } = await render(
      <EngagementCard
        quest={completedQuest}
        role="poster"
        amountMinor={40000}
        counterpart={POSTER}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
        onConfirmDone={onConfirmDone}
      />
    );
    expect(getByText("Confirm and pay")).toBeTruthy();
    await fireEvent.press(getByTestId("engagement-confirm-and-pay"));
    expect(onConfirmDone).toHaveBeenCalled();
  });

  it("never shows Confirm and pay for a doer or applicant, or without onConfirmDone", async () => {
    const completedQuest = { ...QUEST, status: "completed" as const, completedAt: "2026-09-16T08:00:00+08:00" };
    const { queryByTestId: doerQuery } = await render(
      <EngagementCard
        quest={completedQuest}
        role="doer"
        amountMinor={40000}
        counterpart={POSTER}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
        onConfirmDone={() => {}}
      />
    );
    expect(doerQuery("engagement-confirm-and-pay")).toBeNull();

    const { queryByTestId: posterNoHandlerQuery } = await render(
      <EngagementCard
        quest={completedQuest}
        role="poster"
        amountMinor={40000}
        counterpart={POSTER}
        pendingOfferCount={0}
        now={NOW}
        onOpen={() => {}}
      />
    );
    expect(posterNoHandlerQuery("engagement-confirm-and-pay")).toBeNull();
  });
});
