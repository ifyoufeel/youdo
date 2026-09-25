import { render, fireEvent } from "@testing-library/react-native";
import { ErrorState } from "../ErrorState";

describe("ErrorState", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<ErrorState onRetry={() => {}} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("defaults to the generic error copy", async () => {
    const { getByText } = await render(<ErrorState onRetry={() => {}} />);
    expect(getByText(/couldn't reach the server/)).toBeTruthy();
  });

  it("renders a custom message when given one", async () => {
    const { getByText } = await render(<ErrorState message="Couldn't post your quest." onRetry={() => {}} />);
    expect(getByText("Couldn't post your quest.")).toBeTruthy();
  });

  it("calls onRetry when the retry button is pressed", async () => {
    const onRetry = jest.fn();
    const { getByText } = await render(<ErrorState onRetry={onRetry} />);
    await fireEvent.press(getByText("Try again"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
