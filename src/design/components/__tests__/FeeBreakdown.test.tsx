import { render } from "@testing-library/react-native";
import { FeeBreakdown } from "../FeeBreakdown";

describe("FeeBreakdown", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<FeeBreakdown amountMinor={60000} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the gross price, the 10% fee, and the net amount, each formatted", async () => {
    const { getByText } = await render(<FeeBreakdown amountMinor={60000} />);
    expect(getByText("NT$600")).toBeTruthy();
    expect(getByText("Platform fee (10%)")).toBeTruthy();
    expect(getByText("−NT$60")).toBeTruthy();
    expect(getByText("The doer receives")).toBeTruthy();
    expect(getByText("NT$540")).toBeTruthy();
  });

  it("switches the net-amount label for the doer's-eye view", async () => {
    const { getByText } = await render(<FeeBreakdown amountMinor={60000} doerSide />);
    expect(getByText("You receive")).toBeTruthy();
  });

  it("accepts a custom title and note", async () => {
    const { getByText } = await render(
      <FeeBreakdown amountMinor={60000} title="What this costs you" note="A custom note." />
    );
    expect(getByText("What this costs you")).toBeTruthy();
    expect(getByText("A custom note.")).toBeTruthy();
  });
});
