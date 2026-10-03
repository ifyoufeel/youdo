import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { ErrorBoundary } from "../ErrorBoundary";
import { t } from "../../../i18n/t";

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("boom");
  return <Text>Fine</Text>;
}

describe("ErrorBoundary", () => {
  it("renders children normally when nothing throws", async () => {
    const { getByText } = await render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(getByText("Fine")).toBeTruthy();
  });

  it("catches a render error and shows a real retry action instead of crashing the app", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    const { getByTestId, queryByText } = await render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByTestId("error-boundary-fallback")).toBeTruthy();
    expect(queryByText("Fine")).toBeNull();

    consoleError.mockRestore();
  });

  it("retrying remounts children fresh, recovering once the underlying condition clears", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    let shouldThrow = true;
    function Wrapper() {
      return (
        <ErrorBoundary>
          <Bomb shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    }

    const { getByTestId, rerender, getByText } = await render(<Wrapper />);
    expect(getByTestId("error-boundary-fallback")).toBeTruthy();

    // The boundary's own fallback is still on screen — its `children`
    // prop is still last render's throwing element until the parent
    // (here, Wrapper; in the real app, expo-router re-rendering <Slot/>)
    // supplies a fixed one. Clear the condition, let the parent re-render
    // with non-throwing children, *then* retry to unmount the fallback
    // and mount them — matching how a real navigation/data change would
    // resolve this in the app.
    shouldThrow = false;
    rerender(<Wrapper />);
    await fireEvent.press(getByText(t("common.retry")));

    expect(getByText("Fine")).toBeTruthy();
    consoleError.mockRestore();
  });
});
