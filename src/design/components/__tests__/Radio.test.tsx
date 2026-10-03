import { render, fireEvent } from "@testing-library/react-native";
import { Radio } from "../Radio";

describe("Radio", () => {
  it("renders checked/unchecked/disabled/with description with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Radio label="Closest" checked={false} onSelect={() => {}} />);
    await render(<Radio label="Closest" checked onSelect={() => {}} />);
    await render(<Radio label="Closest" checked={false} onSelect={() => {}} disabled />);
    await render(<Radio label="Best paid" description="Highest payout first" checked={false} onSelect={() => {}} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("calls onSelect when pressed", async () => {
    const onSelect = jest.fn();
    const { getByLabelText } = await render(<Radio label="Closest" checked={false} onSelect={onSelect} />);
    await fireEvent.press(getByLabelText("Closest"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("a disabled radio never fires onSelect", async () => {
    const onSelect = jest.fn();
    const { getByLabelText } = await render(<Radio label="Closest" checked={false} onSelect={onSelect} disabled />);
    await fireEvent.press(getByLabelText("Closest"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("exposes checked/disabled state for accessibility", async () => {
    const { getByLabelText } = await render(<Radio label="Closest" checked onSelect={() => {}} />);
    expect(getByLabelText("Closest").props.accessibilityState).toEqual({ checked: true, disabled: false });
  });
});
