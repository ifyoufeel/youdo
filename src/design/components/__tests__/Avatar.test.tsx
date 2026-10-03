import { render } from "@testing-library/react-native";
import { Avatar } from "../Avatar";

describe("Avatar", () => {
  it("renders with no console warnings/errors across sizes and verified/unverified", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Avatar name="Wei-Ting C." size="sm" verified />);
    await render(<Avatar name="Jason H." size="md" />);
    await render(<Avatar name="Mei-Ling W." size="lg" verified />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders initials from the first two words of the name", async () => {
    const { getByText } = await render(<Avatar name="Wei-Ting C." />);
    expect(getByText("WC")).toBeTruthy();
  });

  it("stands alone with no name/rating/meta text — a bare avatar, unlike UserChip", async () => {
    const { queryByText } = await render(<Avatar name="Wei-Ting C." />);
    expect(queryByText("Wei-Ting C.")).toBeNull();
  });

  it("renders the photo instead of initials when photoUrl is set", async () => {
    const { queryByText, getByTestId } = await render(
      <Avatar name="Wei-Ting C." photoUrl="https://example.com/a.jpg" testID="avatar" />
    );
    expect(queryByText("WC")).toBeNull();
    expect(getByTestId("avatar-photo").props.source).toEqual({ uri: "https://example.com/a.jpg" });
  });

  it("falls back to initials when photoUrl is null", async () => {
    const { getByText } = await render(<Avatar name="Wei-Ting C." photoUrl={null} />);
    expect(getByText("WC")).toBeTruthy();
  });
});
