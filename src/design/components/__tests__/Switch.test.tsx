import { render, fireEvent } from "@testing-library/react-native";
import { Switch } from "../Switch";

describe("Switch", () => {
  it("renders on/off/disabled/with description/labelless with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Switch label="Payment notifications" checked={false} onChange={() => {}} />);
    await render(<Switch label="Payment notifications" checked onChange={() => {}} />);
    await render(<Switch label="Payment notifications" checked={false} onChange={() => {}} disabled />);
    await render(
      <Switch label="Quest updates" description="Offers, accepts, and status changes" checked onChange={() => {}} />
    );
    await render(<Switch checked={false} onChange={() => {}} testID="bare-switch" />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("calls onChange with the toggled value when pressed", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(<Switch label="Payment notifications" checked={false} onChange={onChange} />);
    await fireEvent.press(getByLabelText("Payment notifications"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles the other way when already checked", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(<Switch label="Payment notifications" checked onChange={onChange} />);
    await fireEvent.press(getByLabelText("Payment notifications"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("a disabled switch never fires onChange", async () => {
    const onChange = jest.fn();
    const { getByTestId } = await render(
      <Switch checked={false} onChange={onChange} disabled testID="bare-switch" />
    );
    await fireEvent.press(getByTestId("bare-switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("exposes checked/disabled state for accessibility", async () => {
    const { getByLabelText } = await render(<Switch label="Payment notifications" checked onChange={() => {}} />);
    expect(getByLabelText("Payment notifications").props.accessibilityState).toEqual({ checked: true, disabled: false });
  });
});
