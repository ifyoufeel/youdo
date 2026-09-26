import { render, fireEvent } from "@testing-library/react-native";
import { Button, type ButtonVariant } from "../Button";
import { semantic } from "../../tokens/semantic";

const ALL_VARIANTS: ButtonVariant[] = ["primary", "secondary", "inverse", "money", "danger", "ghost"];

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

describe("Button", () => {
  it("renders every variant × size with no console warnings/errors", async () => {
    await withSpies(async () => {
      for (const variant of ALL_VARIANTS) {
        for (const size of ["sm", "md", "lg"] as const) {
          await render(
            <Button variant={variant} size={size} onPress={() => {}}>
              Take quest
            </Button>
          );
        }
      }
    });
  });

  it("renders the label text", async () => {
    const { getByText } = await render(<Button onPress={() => {}}>Take quest</Button>);
    expect(getByText("Take quest")).toBeTruthy();
  });

  it("calls onPress when tapped (shadowed variant, wrapped in Sticker)", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <Button variant="primary" onPress={onPress} testID="btn">
        Take quest
      </Button>
    );
    await fireEvent.press(getByTestId("btn"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("calls onPress when tapped (ghost, not wrapped in Sticker)", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <Button variant="ghost" onPress={onPress} testID="btn">
        Cancel
      </Button>
    );
    await fireEvent.press(getByTestId("btn"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("a disabled button never fires onPress, for a shadowed or ghost variant alike", async () => {
    const onPressShadowed = jest.fn();
    const onPressGhost = jest.fn();
    const shadowed = await render(
      <Button variant="primary" disabled onPress={onPressShadowed} testID="btn">
        Take quest
      </Button>
    );
    await fireEvent.press(shadowed.getByTestId("btn"));
    expect(onPressShadowed).not.toHaveBeenCalled();

    const ghost = await render(
      <Button variant="ghost" disabled onPress={onPressGhost} testID="btn">
        Cancel
      </Button>
    );
    await fireEvent.press(ghost.getByTestId("btn"));
    expect(onPressGhost).not.toHaveBeenCalled();
  });

  it("icon and iconRight both render alongside the label", async () => {
    const { root } = await render(
      <Button icon="plus" iconRight="arrow-right" onPress={() => {}}>
        Post a quest
      </Button>
    );
    const svgs = root!.queryAll((n) => n.type === "RNSVGSvgView");
    expect(svgs.length).toBe(2);
  });

  it("a disabled button uses the disabled fg/bg tokens, not the variant's own", async () => {
    const { getByText } = await render(
      <Button variant="primary" disabled onPress={() => {}}>
        Take quest
      </Button>
    );
    const text = getByText("Take quest");
    expect(text.props.style.color).toBe(semantic.color.action.disabled.fg);
  });
});
