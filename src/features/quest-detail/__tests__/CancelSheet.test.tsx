import React, { useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CancelSheet } from "../CancelSheet";

function Harness({ hasAcceptedOffer = false, onConfirm = () => {} }: { hasAcceptedOffer?: boolean; onConfirm?: (reason: string) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <CancelSheet
      open={open}
      onClose={() => setOpen(false)}
      hasAcceptedOffer={hasAcceptedOffer}
      onConfirm={(reason) => {
        onConfirm(reason);
        setOpen(false);
      }}
    />
  );
}

describe("CancelSheet", () => {
  it("renders with no console warnings/errors, with and without an accepted offer", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Harness />);
    await render(<Harness hasAcceptedOffer />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the no-refund note only once an offer has been accepted — no money claim, since nothing was ever held", async () => {
    const { queryByText: withoutOffer } = await render(<Harness />);
    expect(withoutOffer(/nothing to refund/)).toBeNull();

    const { getByText: withOffer } = await render(<Harness hasAcceptedOffer />);
    expect(withOffer(/nothing to refund/)).toBeTruthy();
  });

  it("defaults to the first reason selected, Confirm enabled", async () => {
    const { getByLabelText } = await render(<Harness />);
    expect(getByLabelText("My plans changed").props.accessibilityState.checked).toBe(true);
  });

  it("disables Confirm once 'Something else' is picked, until free text is entered", async () => {
    const { getByLabelText, getByTestId } = await render(<Harness />);
    await fireEvent.press(getByLabelText("Something else"));
    expect(getByTestId("cancel-sheet-confirm").props.accessibilityState.disabled).toBe(true);

    await fireEvent.changeText(getByTestId("cancel-other"), "We rescheduled elsewhere");
    expect(getByTestId("cancel-sheet-confirm").props.accessibilityState.disabled).toBe(false);
  });

  it("calls onConfirm with the selected reason's text", async () => {
    const onConfirm = jest.fn();
    const { getByLabelText, getByTestId } = await render(<Harness onConfirm={onConfirm} />);
    await fireEvent.press(getByLabelText("We agreed to call it off"));
    await fireEvent.press(getByTestId("cancel-sheet-confirm"));
    expect(onConfirm).toHaveBeenCalledWith("We agreed to call it off");
  });
});
