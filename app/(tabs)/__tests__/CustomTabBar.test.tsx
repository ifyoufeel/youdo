import { render, fireEvent } from "@testing-library/react-native";
import { CustomTabBar } from "../_layout";

function makeState(index: number) {
  return {
    routes: [
      { key: "index", name: "index" },
      { key: "quests", name: "quests" },
      { key: "post", name: "post" },
      { key: "chats", name: "chats" },
      { key: "profile", name: "profile" },
    ],
    index,
  };
}

describe("CustomTabBar", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<CustomTabBar state={makeState(0)} navigation={{ navigate: () => {} }} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders all 5 tab labels in order", async () => {
    const { getByLabelText } = await render(<CustomTabBar state={makeState(0)} navigation={{ navigate: () => {} }} />);
    for (const label of ["Browse", "My quests", "Post", "Chats", "Profile"]) {
      expect(getByLabelText(label)).toBeTruthy();
    }
  });

  it("marks the route at state.index as selected", async () => {
    const { getByLabelText } = await render(<CustomTabBar state={makeState(2)} navigation={{ navigate: () => {} }} />);
    expect(getByLabelText("Post").props.accessibilityState.selected).toBe(true);
    expect(getByLabelText("Browse").props.accessibilityState.selected).toBe(false);
  });

  it("calls navigation.navigate with the pressed route's name", async () => {
    const navigate = jest.fn();
    const { getByLabelText } = await render(<CustomTabBar state={makeState(0)} navigation={{ navigate }} />);
    await fireEvent.press(getByLabelText("Chats"));
    expect(navigate).toHaveBeenCalledWith("chats");
  });
});
