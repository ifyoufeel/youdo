import { render } from "@testing-library/react-native";
import { LoadingState } from "../LoadingState";

describe("LoadingState", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<LoadingState />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("defaults to the generic loading copy", async () => {
    const { getByText } = await render(<LoadingState />);
    expect(getByText("Loading…")).toBeTruthy();
  });

  it("renders a custom label when given one", async () => {
    const { getByText } = await render(<LoadingState label="Finding quests near you…" />);
    expect(getByText("Finding quests near you…")).toBeTruthy();
  });
});
