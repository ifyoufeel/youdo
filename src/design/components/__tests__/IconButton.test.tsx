import { render, fireEvent } from "@testing-library/react-native";
import { IconButton, type IconButtonVariant } from "../IconButton";

const ALL_VARIANTS: IconButtonVariant[] = ["primary", "secondary", "inverse", "ghost"];

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

describe("IconButton", () => {
  it("renders every variant × size with no console warnings/errors", async () => {
    await withSpies(async () => {
      for (const variant of ALL_VARIANTS) {
        for (const size of ["sm", "md", "lg"] as const) {
          await render(
            <IconButton icon="search" accessibilityLabel="Search" variant={variant} size={size} onPress={() => {}} />
          );
        }
      }
    });
  });

  it("calls onPress when tapped (shadowed variant, wrapped in Sticker)", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <IconButton icon="search" accessibilityLabel="Search" onPress={onPress} testID="ib" />
    );
    await fireEvent.press(getByTestId("ib"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("calls onPress when tapped (ghost, not wrapped in Sticker)", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <IconButton icon="x" accessibilityLabel="Close" variant="ghost" onPress={onPress} testID="ib" />
    );
    await fireEvent.press(getByTestId("ib"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("a disabled button never fires onPress", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <IconButton icon="search" accessibilityLabel="Search" disabled onPress={onPress} testID="ib" />
    );
    await fireEvent.press(getByTestId("ib"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders a badge when given one", async () => {
    const { getByText } = await render(
      <IconButton icon="bell" accessibilityLabel="Notifications" badge={3} onPress={() => {}} />
    );
    expect(getByText("3")).toBeTruthy();
  });

  it("exposes accessibilityLabel for screen readers", async () => {
    const { getByLabelText } = await render(
      <IconButton icon="search" accessibilityLabel="Search" onPress={() => {}} testID="ib" />
    );
    expect(getByLabelText("Search")).toBeTruthy();
  });
});
