import { render, fireEvent } from "@testing-library/react-native";
import { Tag } from "../Tag";

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

describe("Tag", () => {
  it("renders selected/unselected, sm/md, with icon and remove, with no console warnings/errors", async () => {
    await withSpies(async () => {
      await render(<Tag>Dog walking</Tag>);
      await render(
        <Tag selected onSelect={() => {}} icon="check" size="sm" onRemove={() => {}}>
          Dog walking
        </Tag>
      );
    });
  });

  it("renders the label text", async () => {
    const { getByText } = await render(<Tag>Dog walking</Tag>);
    expect(getByText("Dog walking")).toBeTruthy();
  });

  it("calls onSelect when pressed", async () => {
    const onSelect = jest.fn();
    const { getByText } = await render(
      <Tag onSelect={onSelect} testID="tag">
        Email
      </Tag>
    );
    await fireEvent.press(getByText("Email"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("is not interactive (a plain View, no press handler) when onSelect is omitted", async () => {
    const { getByTestId } = await render(<Tag testID="tag">Dog walking</Tag>);
    // A non-interactive Tag renders as a View, not a Pressable — pressing
    // it must not throw or call anything.
    expect(() => fireEvent.press(getByTestId("tag"))).not.toThrow();
  });

  it("calls onRemove, not onSelect, when the remove icon is pressed", async () => {
    const onSelect = jest.fn();
    const onRemove = jest.fn();
    const { getByLabelText } = await render(
      <Tag selected onSelect={onSelect} onRemove={onRemove}>
        Dog walking
      </Tag>
    );
    await fireEvent.press(getByLabelText("Remove Dog walking"));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
