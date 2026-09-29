import { render } from "@testing-library/react-native";
import { RatingStar } from "../RatingStar";

describe("RatingStar", () => {
  it("renders md/lg with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<RatingStar value={4.8} />);
    await render(<RatingStar value={4.8} size="lg" />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("formats the value to one decimal place", async () => {
    const { getByText } = await render(<RatingStar value={5} />);
    expect(getByText("5.0")).toBeTruthy();
  });
});
