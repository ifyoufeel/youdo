import { render } from "@testing-library/react-native";
import { StatusTrack } from "../StatusTrack";

describe("StatusTrack", () => {
  it("renders with no console warnings/errors at every current value", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<StatusTrack current={-1} />);
    await render(<StatusTrack current={0} />);
    await render(<StatusTrack current={1} />);
    await render(<StatusTrack current={2} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows all three step labels before paid", async () => {
    const { getByText } = await render(<StatusTrack current={0} />);
    expect(getByText("Accepted")).toBeTruthy();
    expect(getByText("Doing")).toBeTruthy();
  });

  it("collapses to a single 'Paid' row once current reaches the last step", async () => {
    const { getByText, queryByText } = await render(<StatusTrack current={2} />);
    expect(getByText("Paid")).toBeTruthy();
    expect(queryByText("Accepted")).toBeNull();
    expect(queryByText("Doing")).toBeNull();
  });
});
