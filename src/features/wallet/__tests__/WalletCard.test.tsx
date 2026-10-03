import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { WalletCard } from "../WalletCard";

describe("WalletCard", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(
      <WalletCard availableMinor={535500} heldMinor={30000} incomingMinor={49500} onAddMoney={() => {}} onCashOut={() => {}} />
    );
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the formatted available headline", async () => {
    const { getByText } = await render(
      <WalletCard availableMinor={535500} heldMinor={0} incomingMinor={0} onAddMoney={() => {}} onCashOut={() => {}} />
    );
    expect(getByText("NT$5,355")).toBeTruthy();
  });

  it("shows held and incoming badges when both are non-zero", async () => {
    const { getByText, queryByText } = await render(
      <WalletCard availableMinor={535500} heldMinor={30000} incomingMinor={49500} onAddMoney={() => {}} onCashOut={() => {}} />
    );
    expect(getByText("NT$300 held")).toBeTruthy();
    expect(getByText("NT$495 coming")).toBeTruthy();
    expect(queryByText("Nothing held")).toBeNull();
  });

  it("shows a 'nothing held' badge when both are zero", async () => {
    const { getByText } = await render(
      <WalletCard availableMinor={535500} heldMinor={0} incomingMinor={0} onAddMoney={() => {}} onCashOut={() => {}} />
    );
    expect(getByText("Nothing held")).toBeTruthy();
  });

  it("disables Cash out once available is zero or less", async () => {
    const { getByTestId } = await render(
      <WalletCard availableMinor={0} heldMinor={0} incomingMinor={0} onAddMoney={() => {}} onCashOut={() => {}} testID="wallet-card" />
    );
    expect(getByTestId("wallet-card-cash-out").props.accessibilityState.disabled).toBe(true);
  });

  it("calls onAddMoney and onCashOut", async () => {
    const onAddMoney = jest.fn();
    const onCashOut = jest.fn();
    const { getByTestId } = await render(
      <WalletCard availableMinor={535500} heldMinor={0} incomingMinor={0} onAddMoney={onAddMoney} onCashOut={onCashOut} testID="wallet-card" />
    );
    await fireEvent.press(getByTestId("wallet-card-add"));
    await fireEvent.press(getByTestId("wallet-card-cash-out"));
    expect(onAddMoney).toHaveBeenCalledTimes(1);
    expect(onCashOut).toHaveBeenCalledTimes(1);
  });
});
