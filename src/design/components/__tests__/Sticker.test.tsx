/* No physical device or simulator exists in this session (ADR-003 asks
   for a low-end-Android spike). This is the session's proxy: mount and
   drive press/hover through every state and assert nothing warns or
   errors — the real visual/pixel sign-off is deferred to the EAS preview
   channel review ADR-008 already establishes as this project's device
   review process. */
import { render, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";
import { Sticker } from "../Sticker";

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

describe("Sticker", () => {
  it("renders a static (non-interactive) sticker with no console warnings/errors", async () => {
    await withSpies(async () => {
      await render(
        <Sticker radius={20}>
          <Text>Plain card</Text>
        </Sticker>
      );
    });
  });

  it("renders interactive and drives press-in/press-out/hover-in/hover-out with no console warnings/errors", async () => {
    await withSpies(async () => {
      const { getByTestId } = await render(
        <Sticker radius={20} interactive testID="sticker">
          <Text>Take quest</Text>
        </Sticker>
      );
      const pressable = getByTestId("sticker");
      await fireEvent(pressable, "hoverIn");
      await fireEvent(pressable, "pressIn");
      await fireEvent(pressable, "pressOut");
      await fireEvent(pressable, "hoverOut");
    });
  });

  it("calls onPress on a full tap", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <Sticker radius={20} interactive testID="sticker" onPress={onPress}>
        <Text>Take quest</Text>
      </Sticker>
    );
    await fireEvent.press(getByTestId("sticker"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("calls onPressIn / onPressOut on the discrete press-in and press-out events", async () => {
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const { getByTestId } = await render(
      <Sticker radius={20} interactive testID="sticker" onPressIn={onPressIn} onPressOut={onPressOut}>
        <Text>Take quest</Text>
      </Sticker>
    );
    const pressable = getByTestId("sticker");
    await fireEvent(pressable, "pressIn");
    expect(onPressIn).toHaveBeenCalledTimes(1);
    await fireEvent(pressable, "pressOut");
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it("a disabled Sticker does not fire onPress", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <Sticker radius={20} interactive disabled testID="sticker" onPress={onPress}>
        <Text>Take quest</Text>
      </Sticker>
    );
    await fireEvent.press(getByTestId("sticker"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders at every elevation with no console warnings/errors", async () => {
    await withSpies(async () => {
      for (const elevation of ["sm", "md", "lg"] as const) {
        await render(
          <Sticker radius={12} elevation={elevation}>
            <Text>{elevation}</Text>
          </Sticker>
        );
      }
    });
  });
});
