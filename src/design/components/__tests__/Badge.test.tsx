import { render } from "@testing-library/react-native";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders with no console warnings/errors across every tone and both sizes", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const tones = ["neutral", "accent", "money", "hot", "success", "warning", "danger", "info", "ink"] as const;
    for (const tone of tones) {
      await render(<Badge label="Delivery" tone={tone} />);
      await render(<Badge label="Delivery" tone={tone} size="md" icon="check" />);
    }
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders the label", async () => {
    const { getByText } = await render(<Badge label="Tools needed" />);
    expect(getByText("Tools needed")).toBeTruthy();
  });

  it("defaults to the neutral tone and sm size", async () => {
    const { getByText } = await render(<Badge label="Open" testID="badge" />);
    expect(getByText("Open")).toBeTruthy();
  });
});
