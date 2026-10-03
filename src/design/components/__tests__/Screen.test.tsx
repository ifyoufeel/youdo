import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { Screen } from "../Screen";

describe("Screen", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(
      <Screen title="Browse">
        <Text>Body content</Text>
      </Screen>
    );
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders the TopBar title and the children", async () => {
    const { getByText } = await render(
      <Screen title="Browse">
        <Text>Body content</Text>
      </Screen>
    );
    expect(getByText("Browse")).toBeTruthy();
    expect(getByText("Body content")).toBeTruthy();
  });

  it("renders slab content only when given", async () => {
    const { queryByText, rerender } = await render(
      <Screen title="Detail">
        <Text>Body</Text>
      </Screen>
    );
    expect(queryByText("Accept offer")).toBeNull();

    await rerender(
      <Screen title="Detail" slab={<Text>Accept offer</Text>}>
        <Text>Body</Text>
      </Screen>
    );
    expect(queryByText("Accept offer")).toBeTruthy();
  });

  it("still renders children when scroll is false (e.g. a list-managed body)", async () => {
    const { getByText } = await render(
      <Screen title="Browse" scroll={false}>
        <Text>Feed content</Text>
      </Screen>
    );
    expect(getByText("Feed content")).toBeTruthy();
  });
});
