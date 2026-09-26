import React, { useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { OfferSheet } from "../OfferSheet";

function Harness({ errorMessage = null }: { errorMessage?: string | null }) {
  const [open, setOpen] = useState(true);
  return (
    <OfferSheet
      open={open}
      onClose={() => setOpen(false)}
      askingPriceMinor={40000}
      posterName="Wei-Ting C."
      errorMessage={errorMessage}
      onSubmit={() => setOpen(false)}
    />
  );
}

describe("OfferSheet", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Harness />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("defaults to asking-price mode, showing the formatted asking price", async () => {
    const { getByLabelText } = await render(<Harness />);
    expect(getByLabelText("Take it at NT$400").props.accessibilityState.checked).toBe(true);
  });

  it("switching to custom mode reveals the price input", async () => {
    const { getByLabelText, queryByTestId, getByTestId } = await render(<Harness />);
    expect(queryByTestId("offer-price")).toBeNull();
    await fireEvent.press(getByLabelText("Offer a different price"));
    expect(getByTestId("offer-price")).toBeTruthy();
  });

  it("disables submit once a custom price is cleared to zero", async () => {
    const { getByLabelText, getByTestId } = await render(<Harness />);
    await fireEvent.press(getByLabelText("Offer a different price"));
    await fireEvent.changeText(getByTestId("offer-price"), "0");
    expect(getByTestId("offer-submit").props.accessibilityState.disabled).toBe(true);
  });

  it("submits the asking price with the note when in asking mode", async () => {
    const onSubmit = jest.fn();
    const { getByTestId } = await render(
      <OfferSheet
        open
        onClose={() => {}}
        askingPriceMinor={40000}
        posterName="Wei-Ting C."
        onSubmit={onSubmit}
      />
    );
    await fireEvent.changeText(getByTestId("offer-note"), "Happy to help.");
    await fireEvent.press(getByTestId("offer-submit"));
    expect(onSubmit).toHaveBeenCalledWith(40000, "Happy to help.");
  });

  it("submits the parsed custom amount", async () => {
    const onSubmit = jest.fn();
    const { getByLabelText, getByTestId } = await render(
      <OfferSheet open onClose={() => {}} askingPriceMinor={40000} posterName="Wei-Ting C." onSubmit={onSubmit} />
    );
    await fireEvent.press(getByLabelText("Offer a different price"));
    await fireEvent.changeText(getByTestId("offer-price"), "350");
    await fireEvent.press(getByTestId("offer-submit"));
    expect(onSubmit).toHaveBeenCalledWith(35000, "");
  });

  it("shows an inline error message when given", async () => {
    const { getByText } = await render(<Harness errorMessage="You already have an offer on this quest" />);
    expect(getByText("You already have an offer on this quest")).toBeTruthy();
  });
});
