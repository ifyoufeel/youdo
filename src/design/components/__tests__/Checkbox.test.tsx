import { render, fireEvent } from "@testing-library/react-native";
import { Checkbox } from "../Checkbox";

describe("Checkbox", () => {
  it("renders checked/unchecked/disabled/with description with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Checkbox label="Today only" checked={false} onChange={() => {}} />);
    await render(<Checkbox label="Today only" checked onChange={() => {}} />);
    await render(<Checkbox label="Today only" checked={false} onChange={() => {}} disabled />);
    await render(
      <Checkbox label="Verified posters only" description="Only show quests from verified posters" checked={false} onChange={() => {}} />
    );
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("calls onChange with the toggled value when pressed", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(<Checkbox label="Today only" checked={false} onChange={onChange} />);
    await fireEvent.press(getByLabelText("Today only"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles the other way when already checked", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(<Checkbox label="Today only" checked onChange={onChange} />);
    await fireEvent.press(getByLabelText("Today only"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("a disabled checkbox never fires onChange", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(<Checkbox label="Today only" checked={false} onChange={onChange} disabled />);
    await fireEvent.press(getByLabelText("Today only"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("exposes checked/disabled state for accessibility", async () => {
    const { getByLabelText } = await render(<Checkbox label="Today only" checked onChange={() => {}} />);
    expect(getByLabelText("Today only").props.accessibilityState).toEqual({ checked: true, disabled: false });
  });
});
