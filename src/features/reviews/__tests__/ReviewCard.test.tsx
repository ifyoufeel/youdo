import { render } from "@testing-library/react-native";
import { ReviewCard } from "../ReviewCard";
import type { Review } from "@data/contracts";

const REVIEW: Review = {
  id: "r1",
  questId: "q8",
  raterId: "u2",
  rateeId: "u0",
  rating: 5,
  comment: "Queued in the rain without being asked twice.",
  at: "2026-09-13T12:30:00+08:00",
};

describe("ReviewCard", () => {
  it("renders with no console warnings/errors, with and without a comment", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<ReviewCard review={REVIEW} raterName="Wei-Ting C." />);
    await render(<ReviewCard review={{ ...REVIEW, comment: "" }} raterName="Wei-Ting C." />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the rater's real name and rating", async () => {
    const { getByText } = await render(<ReviewCard review={REVIEW} raterName="Wei-Ting C." />);
    expect(getByText("Wei-Ting C.")).toBeTruthy();
    expect(getByText("5")).toBeTruthy();
  });

  it("shows the comment when present", async () => {
    const { getByText } = await render(<ReviewCard review={REVIEW} raterName="Wei-Ting C." />);
    expect(getByText("Queued in the rain without being asked twice.")).toBeTruthy();
  });

  it("falls back gracefully when the rater's name hasn't resolved yet", async () => {
    const { getByText } = await render(<ReviewCard review={REVIEW} raterName={undefined} />);
    expect(getByText("—")).toBeTruthy();
  });
});
