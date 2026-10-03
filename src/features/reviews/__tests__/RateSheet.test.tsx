import React, { useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { RateSheet } from "../RateSheet";
import type { User } from "@data/contracts";

const COUNTERPART: User = {
  id: "u2",
  name: "Wei-Ting C.",
  rating: 4.8,
  questsCompleted: 27,
  verified: true,
  area: "Da'an",
  home: { x: 0, y: 0 },
  cancelRate: 0.03,
  bio: "",
  phone: "+886 900 000 000",
  email: "wei@example.com",
  bank: "Bank of Taiwan",
  joined: "2025-01-01T00:00:00+08:00",
  avatarUrl: null,
};

function Harness() {
  const [open, setOpen] = useState(true);
  return <RateSheet open={open} onClose={() => setOpen(false)} counterpart={COUNTERPART} onConfirm={() => setOpen(false)} />;
}

describe("RateSheet", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Harness />);
    await render(<RateSheet open onClose={() => {}} counterpart={null} onConfirm={() => {}} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the counterpart's name in the subtitle", async () => {
    const { getByText } = await render(<Harness />);
    expect(getByText("Your rating of Wei-Ting C. shows once they rate you back")).toBeTruthy();
  });

  it("submit stays disabled until a star is picked, then reflects the rating word", async () => {
    const { getByTestId, getByText, getByLabelText } = await render(<Harness />);
    expect(getByTestId("rate-sheet-confirm").props.accessibilityState.disabled).toBe(true);
    expect(getByText("Tap a star")).toBeTruthy();
    await fireEvent.press(getByLabelText("5 stars"));
    expect(getByTestId("rate-sheet-confirm").props.accessibilityState.disabled).toBe(false);
    expect(getByText("Excellent")).toBeTruthy();
  });

  it("confirms with the picked rating and comment", async () => {
    const onConfirm = jest.fn();
    const { getByTestId, getByLabelText } = await render(
      <RateSheet open onClose={() => {}} counterpart={COUNTERPART} onConfirm={onConfirm} />
    );
    await fireEvent.press(getByLabelText("4 stars"));
    await fireEvent.changeText(getByTestId("rate-sheet-comment"), "Great to work with.");
    await fireEvent.press(getByTestId("rate-sheet-confirm"));
    expect(onConfirm).toHaveBeenCalledWith(4, "Great to work with.");
  });

  it("resets rating and comment each time it reopens", async () => {
    const { getByTestId, getByLabelText, getByText, rerender } = await render(
      <RateSheet open onClose={() => {}} counterpart={COUNTERPART} onConfirm={() => {}} />
    );
    await fireEvent.press(getByLabelText("3 stars"));
    expect(getByText("Fine")).toBeTruthy();

    await rerender(<RateSheet open={false} onClose={() => {}} counterpart={COUNTERPART} onConfirm={() => {}} />);
    await rerender(<RateSheet open onClose={() => {}} counterpart={COUNTERPART} onConfirm={() => {}} />);
    expect(getByText("Tap a star")).toBeTruthy();
    expect(getByTestId("rate-sheet-comment").props.value).toBe("");
  });
});
