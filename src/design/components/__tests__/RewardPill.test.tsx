import { render } from "@testing-library/react-native";
import { RewardPill } from "../RewardPill";

describe("RewardPill", () => {
  it("renders with no console warnings/errors, md and lg", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<RewardPill amount="NT$400" />);
    await render(<RewardPill amount="NT$1,050" size="lg" />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders the amount text", async () => {
    const { getByText } = await render(<RewardPill amount="NT$400" />);
    expect(getByText("NT$400")).toBeTruthy();
  });
});
