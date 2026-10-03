import { render } from "@testing-library/react-native";
import { InfoRow } from "../InfoRow";

describe("InfoRow", () => {
  it("renders with no console warnings/errors, with and without an icon", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<InfoRow label="Where" value="Da'an" />);
    await render(<InfoRow label="When" value="17 Sep, 2pm" icon="calendar" />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders the label and value", async () => {
    const { getByText } = await render(<InfoRow label="How long" value="~25 min" />);
    expect(getByText("How long")).toBeTruthy();
    expect(getByText("~25 min")).toBeTruthy();
  });
});
