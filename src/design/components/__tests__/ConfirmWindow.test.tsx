import { render } from "@testing-library/react-native";
import { ConfirmWindow } from "../ConfirmWindow";
import type { Quest } from "@data/contracts";

const BASE_QUEST: Quest = {
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
  status: "completed",
  acceptedOfferId: "o1",
  addressLine: "14B, Lane 31, Yongkang St",
  area: "Da'an",
  details: "",
  requirements: [],
  completedAt: "2026-09-16T19:00:00+08:00",
};

const NOW = Date.parse("2026-09-16T20:00:00+08:00"); // 1 hour after completedAt, well within the 72h window

describe("ConfirmWindow", () => {
  it("renders with no console warnings/errors, doer and poster side alike", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<ConfirmWindow quest={BASE_QUEST} now={NOW} doerSide />);
    await render(<ConfirmWindow quest={BASE_QUEST} now={NOW} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows time left to confirm while the window is open", async () => {
    const { getByText } = await render(<ConfirmWindow quest={BASE_QUEST} now={NOW} />);
    expect(getByText(/left to confirm/)).toBeTruthy();
  });

  it("shows the closed message once the 72h window has passed", async () => {
    const wayLater = Date.parse("2026-09-20T00:00:00+08:00");
    const { getByText } = await render(<ConfirmWindow quest={BASE_QUEST} now={wayLater} />);
    expect(getByText("The confirm window has closed")).toBeTruthy();
  });

  it("shows doer-worded copy on the doer's side", async () => {
    const { getByText } = await render(<ConfirmWindow quest={BASE_QUEST} now={NOW} doerSide />);
    expect(getByText(/releases to you automatically/)).toBeTruthy();
  });

  it("shows poster-worded copy on the poster's side", async () => {
    const { getByText } = await render(<ConfirmWindow quest={BASE_QUEST} now={NOW} />);
    expect(getByText(/nobody is left waiting/)).toBeTruthy();
  });
});
