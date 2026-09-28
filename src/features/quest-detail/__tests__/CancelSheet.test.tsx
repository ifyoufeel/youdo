import React, { useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CancelSheet } from "../CancelSheet";

function Harness({ refundMinor = null, onConfirm = () => {} }: { refundMinor?: number | null; onConfirm?: (reason: string) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <CancelSheet
      open={open}
      onClose={() => setOpen(false)}
      refundMinor={refundMinor}
      onConfirm={(reason) => {
        onConfirm(reason);
        setOpen(false);
      }}
    />
  );
}

describe("CancelSheet", () => {
  it("renders with no console warnings/errors, with and without a refund", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Harness />);
    await render(<Harness refundMinor={40000} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the real refund amount only once an offer was accepted — real money, real escrow since M5", async () => {
    const { queryByText: withoutOffer } = await render(<Harness />);
    expect(withoutOffer("Refunded in full")).toBeNull();

    const { getByText: withOffer } = await render(<Harness refundMinor={40000} />);
    expect(withOffer("Refunded in full")).toBeTruthy();
    expect(withOffer("NT$400")).toBeTruthy();
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
