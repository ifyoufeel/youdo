import React, { useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ReportSheet } from "../ReportSheet";

function Harness() {
  const [open, setOpen] = useState(true);
  return (
    <ReportSheet
      open={open}
      onClose={() => setOpen(false)}
      name="Wei-Ting C."
      onReport={() => setOpen(false)}
      onBlock={() => setOpen(false)}
    />
  );
}

describe("ReportSheet", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Harness />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("carries the target's name in the title", async () => {
    const { getByText } = await render(<Harness />);
    expect(getByText("Report Wei-Ting C.")).toBeTruthy();
  });

  it("defaults to the first reason selected", async () => {
    const { getByLabelText } = await render(<Harness />);
    expect(getByLabelText("They didn't turn up").props.accessibilityState.checked).toBe(true);
  });

  it("calls onReport with the selected reason", async () => {
    const onReport = jest.fn();
    const { getByLabelText, getByTestId } = await render(
      <ReportSheet open onClose={() => {}} name="Wei-Ting C." onReport={onReport} onBlock={() => {}} />
    );
    await fireEvent.press(getByLabelText("They were rude or threatening"));
    await fireEvent.press(getByTestId("report-sheet-confirm"));
    expect(onReport).toHaveBeenCalledWith("They were rude or threatening");
  });

  it("calls onBlock when Block this person is pressed", async () => {
    const onBlock = jest.fn();
    const { getByTestId } = await render(
      <ReportSheet open onClose={() => {}} name="Wei-Ting C." onReport={() => {}} onBlock={onBlock} />
    );
    await fireEvent.press(getByTestId("block-user"));
    expect(onBlock).toHaveBeenCalled();
  });

  it("resets the selected reason each time it reopens", async () => {
    const { getByLabelText, rerender } = await render(
      <ReportSheet open onClose={() => {}} name="Wei-Ting C." onReport={() => {}} onBlock={() => {}} />
    );
    await fireEvent.press(getByLabelText("Something else"));
    expect(getByLabelText("Something else").props.accessibilityState.checked).toBe(true);

    await rerender(<ReportSheet open={false} onClose={() => {}} name="Wei-Ting C." onReport={() => {}} onBlock={() => {}} />);
    await rerender(<ReportSheet open onClose={() => {}} name="Wei-Ting C." onReport={() => {}} onBlock={() => {}} />);
    expect(getByLabelText("They didn't turn up").props.accessibilityState.checked).toBe(true);
  });
});
