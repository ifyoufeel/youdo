import { render, fireEvent } from "@testing-library/react-native";
import { StarPicker } from "../StarPicker";

describe("StarPicker", () => {
  it("renders at every value with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    for (let n = 0; n <= 5; n++) {
      await render(<StarPicker value={n} onChange={() => {}} />);
    }
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("calls onChange with the pressed star's value", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(<StarPicker value={0} onChange={onChange} />);
    await fireEvent.press(getByLabelText("4 stars"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("singularizes the first star's label", async () => {
    const { getByLabelText } = await render(<StarPicker value={0} onChange={() => {}} />);
    expect(getByLabelText("1 star")).toBeTruthy();
  });

  it("marks every star up to the current value as selected", async () => {
    const { getByTestId } = await render(<StarPicker value={3} onChange={() => {}} testID="stars" />);
    expect(getByTestId("stars-3").props.accessibilityState.selected).toBe(true);
    expect(getByTestId("stars-4").props.accessibilityState.selected).toBe(false);
  });
});
