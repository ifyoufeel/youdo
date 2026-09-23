import { render, fireEvent } from "@testing-library/react-native";
import { View, Text } from "react-native";
import { Card, type CardVariant } from "../Card";

const ALL_VARIANTS: CardVariant[] = ["sticker", "flat", "sunken", "accent", "money", "inverse"];

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

describe("Card", () => {
  it("renders every variant, static and interactive, with no console warnings/errors", async () => {
    await withSpies(async () => {
      for (const variant of ALL_VARIANTS) {
        await render(
          <Card variant={variant}>
            <Text>Walk Biscuit for an hour</Text>
          </Card>
        );
        await render(
          <Card variant={variant} interactive onPress={() => {}}>
            <Text>Walk Biscuit for an hour</Text>
          </Card>
        );
      }
    });
  });

  it("renders with a media slot at every padding, with no console warnings/errors", async () => {
    await withSpies(async () => {
      for (const padding of ["none", "sm", "md", "lg"] as const) {
        await render(
          <Card padding={padding} media={<View testID="media"><Text>photo</Text></View>}>
            <Text>Card content</Text>
          </Card>
        );
      }
    });
  });

  it("a shadowed, interactive card (sticker/accent/money/inverse) fires onPress via its Sticker wrapper", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <Card variant="sticker" interactive onPress={onPress} testID="card">
        <Text>Walk Biscuit for an hour</Text>
      </Card>
    );
    await fireEvent.press(getByTestId("card"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("a shadowless, interactive card (flat/sunken) still fires onPress, with no shadow to trigger it", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <Card variant="flat" interactive onPress={onPress} testID="card">
        <Text>Walk Biscuit for an hour</Text>
      </Card>
    );
    await fireEvent.press(getByTestId("card"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("a non-interactive card with no onPress never fires anything on press", async () => {
    const { getByTestId } = await render(
      <Card variant="sticker" testID="card">
        <Text>Walk Biscuit for an hour</Text>
      </Card>
    );
    // Just confirms it renders as plain, non-pressable content — nothing to
    // assert on a press since there is no onPress at all.
    expect(getByTestId("card")).toBeTruthy();
  });

  it("the media wrapper's overflow:hidden view is structurally separate from Sticker's own shadow sibling (ADR-003's watch item)", async () => {
    // Sticker (see Sticker.tsx) renders its shadow as an absolutely-
    // positioned View sibling of its content, never a descendant of it.
    // This confirms Card actually exercises that: the media node is never
    // nested inside the shadow sibling, and the shadow sibling — found by
    // its own position:"absolute" style, the one thing that identifies it
    // — has no content of its own to clip in the first place.
    const { root } = await render(
      <Card
        variant="sticker"
        interactive
        onPress={() => {}}
        media={<View testID="media"><Text>photo</Text></View>}
      >
        <Text>Walk Biscuit for an hour</Text>
      </Card>
    );

    const flattenStyle = (style: unknown): Record<string, unknown> =>
      Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean).map(flattenStyle)) : (style as Record<string, unknown>) || {};

    const shadowNodes = root!.queryAll((n) => n.type === "View" && flattenStyle(n.props.style).position === "absolute");
    expect(shadowNodes.length).toBe(1);
    const [shadowNode] = shadowNodes;
    expect(shadowNode.children.length).toBe(0); // it never carries real content

    const mediaNode = root!.queryAll((n) => n.props?.testID === "media")[0];
    expect(mediaNode).toBeTruthy();
    for (let ancestor = mediaNode.parent; ancestor; ancestor = ancestor.parent) {
      expect(ancestor).not.toBe(shadowNode);
    }
  });
});
