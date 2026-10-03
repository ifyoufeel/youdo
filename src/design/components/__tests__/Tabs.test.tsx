import { render, fireEvent } from "@testing-library/react-native";
import { Tabs } from "../Tabs";

const ITEMS = [
  { value: "active", label: "Active", count: 2 },
  { value: "offers", label: "Offers" },
  { value: "done", label: "Done", count: 0 },
];

describe("Tabs", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Tabs items={ITEMS} value="active" onChange={() => {}} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders every item's label", async () => {
    const { getByText } = await render(<Tabs items={ITEMS} value="active" onChange={() => {}} />);
    expect(getByText("Active")).toBeTruthy();
    expect(getByText("Offers")).toBeTruthy();
    expect(getByText("Done")).toBeTruthy();
  });

  it("renders a count badge only for items that have one", async () => {
    const { getByText, queryByText } = await render(<Tabs items={ITEMS} value="active" onChange={() => {}} />);
    expect(getByText("2")).toBeTruthy();
    expect(getByText("0")).toBeTruthy();
    // "offers" has no count prop at all — nothing extra should render for it.
    expect(queryByText("undefined")).toBeNull();
  });

  it("marks the current value selected and calls onChange when another tab is pressed", async () => {
    const onChange = jest.fn();
    const { getByTestId } = await render(
      <Tabs items={ITEMS} value="active" onChange={onChange} testID="my-tabs" />
    );
    expect(getByTestId("my-tabs-active").props.accessibilityState.selected).toBe(true);
    expect(getByTestId("my-tabs-offers").props.accessibilityState.selected).toBe(false);

    await fireEvent.press(getByTestId("my-tabs-offers"));
    expect(onChange).toHaveBeenCalledWith("offers");
  });
});
