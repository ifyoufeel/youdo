import { render, fireEvent } from "@testing-library/react-native";
import { Select } from "../Select";

const OPTIONS = [
  { value: "1", label: "Within 1 km" },
  { value: "3", label: "Within 3 km" },
  { value: "5", label: "Within 5 km" },
];

describe("Select", () => {
  it("renders with no console warnings/errors, closed and open", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { getByTestId } = await render(
      <Select label="Distance" value="3" options={OPTIONS} onChange={() => {}} testID="select" />
    );
    await fireEvent.press(getByTestId("select"));
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the selected option's label in the field", async () => {
    const { getByText } = await render(
      <Select label="Distance" value="3" options={OPTIONS} onChange={() => {}} />
    );
    expect(getByText("Within 3 km")).toBeTruthy();
  });

  it("opens the sheet and lists every option when pressed", async () => {
    const { getByTestId, getByLabelText } = await render(
      <Select label="Distance" value="3" options={OPTIONS} onChange={() => {}} testID="select" />
    );
    await fireEvent.press(getByTestId("select"));
    expect(getByLabelText("Within 1 km")).toBeTruthy();
    expect(getByLabelText("Within 5 km")).toBeTruthy();
  });

  it("calls onChange and closes the sheet when an option is picked", async () => {
    const onChange = jest.fn();
    const { getByTestId, getByLabelText, queryByLabelText } = await render(
      <Select label="Distance" value="3" options={OPTIONS} onChange={onChange} testID="select" />
    );
    await fireEvent.press(getByTestId("select"));
    await fireEvent.press(getByLabelText("Within 5 km"));
    expect(onChange).toHaveBeenCalledWith("5");
    expect(queryByLabelText("Within 1 km")).toBeNull();
  });

  it("marks the current value's Radio as checked in the sheet", async () => {
    const { getByTestId, getByLabelText } = await render(
      <Select label="Distance" value="3" options={OPTIONS} onChange={() => {}} testID="select" />
    );
    await fireEvent.press(getByTestId("select"));
    expect(getByLabelText("Within 3 km").props.accessibilityState.checked).toBe(true);
    expect(getByLabelText("Within 1 km").props.accessibilityState.checked).toBe(false);
  });
});
