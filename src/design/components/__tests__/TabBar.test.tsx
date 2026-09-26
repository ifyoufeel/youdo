import { render, fireEvent } from "@testing-library/react-native";
import { TabBar, type TabBarItem } from "../TabBar";

const ITEMS: TabBarItem[] = [
  { key: "browse", label: "Browse", icon: "search" },
  { key: "quests", label: "My quests", icon: "list-checks", badge: 2 },
  { key: "post", label: "Post", icon: "plus" },
  { key: "chats", label: "Chats", icon: "message-circle" },
  { key: "profile", label: "Profile", icon: "user" },
];

async function withSpies(fn: () => void | Promise<void>) {
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  try {
    await fn();
  } finally {
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  }
}

describe("TabBar", () => {
  it("renders all 5 items with no console warnings/errors", async () => {
    await withSpies(async () => {
      await render(<TabBar items={ITEMS} value="browse" onChange={() => {}} />);
    });
  });

  it("calls onChange with the pressed tab's key", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(<TabBar items={ITEMS} value="browse" onChange={onChange} />);
    await fireEvent.press(getByLabelText("Post"));
    expect(onChange).toHaveBeenCalledWith("post");
  });

  it("marks the active tab as selected for accessibility", async () => {
    const { getByLabelText } = await render(<TabBar items={ITEMS} value="chats" onChange={() => {}} />);
    expect(getByLabelText("Chats").props.accessibilityState.selected).toBe(true);
    expect(getByLabelText("Browse").props.accessibilityState.selected).toBe(false);
  });

  it("renders a badge when an item has one", async () => {
    const { getByText } = await render(<TabBar items={ITEMS} value="browse" onChange={() => {}} />);
    expect(getByText("2")).toBeTruthy();
  });
});
