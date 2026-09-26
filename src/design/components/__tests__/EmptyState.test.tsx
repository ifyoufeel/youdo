import { render, fireEvent } from "@testing-library/react-native";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders with no console warnings/errors, with and without an action", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<EmptyState title="No quests nearby yet" />);
    await render(<EmptyState title="No quests nearby yet" action="Widen search" onAction={() => {}} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders the title", async () => {
    const { getByText } = await render(<EmptyState title="No quests nearby yet" />);
    expect(getByText("No quests nearby yet")).toBeTruthy();
  });

  it("omits the action button when none is given", async () => {
    const { queryByText } = await render(<EmptyState title="No quests nearby yet" />);
    expect(queryByText("Widen search")).toBeNull();
  });

  it("calls onAction when the action button is pressed", async () => {
    const onAction = jest.fn();
    const { getByText } = await render(
      <EmptyState title="No quests nearby yet" action="Widen search" onAction={onAction} />
    );
    await fireEvent.press(getByText("Widen search"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
