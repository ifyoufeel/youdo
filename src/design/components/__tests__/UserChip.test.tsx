import { render } from "@testing-library/react-native";
import { UserChip } from "../UserChip";

describe("UserChip", () => {
  it("renders with no console warnings/errors across sizes and verified/unverified", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<UserChip name="Wei-Ting C." rating={4.9} questsCompleted={38} verified size="sm" />);
    await render(<UserChip name="Jason H." size="md" />);
    await render(<UserChip name="Mei-Ling W." rating={5} questsCompleted={3} verified meta="Posted this quest" size="lg" />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders the name, quest count and rating", async () => {
    const { getByText } = await render(<UserChip name="Wei-Ting C." rating={4.9} questsCompleted={38} />);
    expect(getByText("Wei-Ting C.")).toBeTruthy();
    expect(getByText("38 quests")).toBeTruthy();
    expect(getByText("4.9")).toBeTruthy();
  });

  it("renders initials from the first two words of the name", async () => {
    const { getByText } = await render(<UserChip name="Wei-Ting C." />);
    // "Wei-Ting" and "C." each contribute their first character.
    expect(getByText("WC")).toBeTruthy();
  });

  it("renders extra meta text when given", async () => {
    const { getByText } = await render(<UserChip name="Alex L." meta="Doing this quest" />);
    expect(getByText("Doing this quest")).toBeTruthy();
  });

  it("omits quest count and rating when not given", async () => {
    const { queryByText } = await render(<UserChip name="Alex L." />);
    expect(queryByText(/quests/)).toBeNull();
  });
});
