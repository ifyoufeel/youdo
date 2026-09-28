import React, { useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CashOutSheet } from "../CashOutSheet";

function Harness({ spendableMinor = 535500 }: { spendableMinor?: number }) {
  const [open, setOpen] = useState(true);
  return (
    <CashOutSheet
      open={open}
      onClose={() => setOpen(false)}
      onSubmit={() => setOpen(false)}
      bank="CTBC •••• 4417"
      spendableMinor={spendableMinor}
    />
  );
}

describe("CashOutSheet", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Harness />);
    await render(<Harness spendableMinor={0} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("prefills the amount to the full spendable balance on open", async () => {
    const { getByTestId } = await render(<Harness spendableMinor={535500} />);
    expect(getByTestId("cash-out-amount").props.value).toBe("5355");
  });

  it("enables submit when the prefilled amount is spendable", async () => {
    const { getByTestId } = await render(<Harness spendableMinor={535500} />);
    expect(getByTestId("cash-out-submit").props.accessibilityState.disabled).toBe(false);
  });

  it("disables submit and shows an error once the amount exceeds spendable", async () => {
    const { getByTestId, getByText } = await render(<Harness spendableMinor={100} />);
    await fireEvent.changeText(getByTestId("cash-out-amount"), "500");
    expect(getByTestId("cash-out-submit").props.accessibilityState.disabled).toBe(true);
    expect(getByText("That's more than you have available")).toBeTruthy();
  });

  it("disables submit at zero spendable (the prefilled '0' amount is non-empty, so the same error shows, matching the prototype's own condition)", async () => {
    const { getByTestId, getByText } = await render(<Harness spendableMinor={0} />);
    expect(getByTestId("cash-out-submit").props.accessibilityState.disabled).toBe(true);
    expect(getByText("That's more than you have available")).toBeTruthy();
  });

  it("submits the exact minor-unit amount", async () => {
    const onSubmit = jest.fn();
    const { getByTestId } = await render(
      <CashOutSheet open onClose={() => {}} onSubmit={onSubmit} bank="CTBC •••• 4417" spendableMinor={535500} />
    );
    await fireEvent.changeText(getByTestId("cash-out-amount"), "300");
    await fireEvent.press(getByTestId("cash-out-submit"));
    expect(onSubmit).toHaveBeenCalledWith(30000);
  });

  it("shows what's left after the cash-out", async () => {
    const { getByTestId, getByText } = await render(<Harness spendableMinor={535500} />);
    await fireEvent.changeText(getByTestId("cash-out-amount"), "300");
    expect(getByText("NT$5,055")).toBeTruthy(); // 535500 - 30000
  });
});
