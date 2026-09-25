import { render, fireEvent } from "@testing-library/react-native";
import { View } from "react-native";
import { TopBar } from "../TopBar";

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

describe("TopBar", () => {
  it("renders title+subtitle, wordmark, and with actions with no console warnings/errors", async () => {
    await withSpies(async () => {
      await render(<TopBar title="Quest detail" subtitle="Da'an" />);
      await render(<TopBar wordmark />);
      await render(<TopBar title="Browse" actions={<View testID="action" />} />);
      await render(<TopBar title="Browse" onBack={() => {}} />);
    });
  });

  it("renders the title text", async () => {
    const { getByText } = await render(<TopBar title="Quest detail" />);
    expect(getByText("Quest detail")).toBeTruthy();
  });

  it("renders the wordmark lockup instead of title when wordmark is set", async () => {
    const { getByText, queryByText } = await render(<TopBar title="Browse" wordmark />);
    expect(getByText("DO")).toBeTruthy();
    expect(queryByText("Browse")).toBeNull();
  });

  it("calls onBack when the back button is pressed", async () => {
    const onBack = jest.fn();
    const { getByLabelText } = await render(<TopBar title="Quest detail" onBack={onBack} />);
    await fireEvent.press(getByLabelText("Back"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("omits the back button when onBack is not given", async () => {
    const { queryByLabelText } = await render(<TopBar title="Browse" />);
    expect(queryByLabelText("Back")).toBeNull();
  });
});
