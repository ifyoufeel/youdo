import React, { useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { DepositSheet } from "../DepositSheet";

function Harness(props: { presetMinor?: number; reason?: string }) {
  const [open, setOpen] = useState(true);
  return (
    <DepositSheet
      open={open}
      onClose={() => setOpen(false)}
      onSubmit={() => setOpen(false)}
      bank="CTBC •••• 4417"
      availableMinor={535500}
      presetMinor={props.presetMinor}
      reason={props.reason}
    />
  );
}

describe("DepositSheet", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Harness />);
    await render(<Harness presetMinor={12000} reason="Add NT$120 to your wallet and you can hold this offer." />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("disables submit with no amount entered", async () => {
    const { getByTestId } = await render(<Harness />);
    expect(getByTestId("deposit-submit").props.accessibilityState.disabled).toBe(true);
  });

  it("selecting a preset amount enables submit and shows the wallet-after total", async () => {
    const { getByText, getByTestId } = await render(<Harness />);
    await fireEvent.press(getByText("NT$500"));
    expect(getByTestId("deposit-submit").props.accessibilityState.disabled).toBe(false);
    expect(getByText("NT$5,855")).toBeTruthy(); // 535500 + 50000, minor-to-major
  });

  it("typing a custom amount parses to minor units on submit", async () => {
    const onSubmit = jest.fn();
    const { getByTestId } = await render(
      <DepositSheet open onClose={() => {}} onSubmit={onSubmit} bank="CTBC •••• 4417" availableMinor={0} />
    );
    await fireEvent.changeText(getByTestId("deposit-amount"), "350");
    await fireEvent.press(getByTestId("deposit-submit"));
    expect(onSubmit).toHaveBeenCalledWith(35000);
  });

  it("prefills the custom field from presetMinor when opened", async () => {
    const { getByTestId } = await render(<Harness presetMinor={12000} />);
    expect(getByTestId("deposit-amount").props.value).toBe("120");
  });

  it("shows the reason card only when a reason is given", async () => {
    const { getByText } = await render(<Harness reason="Add NT$120 to your wallet and you can hold this offer." />);
    expect(getByText("Add NT$120 to your wallet and you can hold this offer.")).toBeTruthy();

    const { queryByText: queryNoReason } = await render(<Harness />);
    expect(queryNoReason("Add NT$120 to your wallet and you can hold this offer.")).toBeNull();
  });

  it("shows the signed-in user's bank as the source", async () => {
    const { getByText } = await render(<Harness />);
    expect(getByText("CTBC •••• 4417")).toBeTruthy();
  });
});
