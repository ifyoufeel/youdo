import { render, fireEvent } from "@testing-library/react-native";
import { Toast, type ToastTone } from "../Toast";

const ALL_TONES: ToastTone[] = ["neutral", "success", "money", "danger"];

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

describe("Toast", () => {
  it("renders every tone, with and without an action, with no console warnings/errors", async () => {
    await withSpies(async () => {
      for (const tone of ALL_TONES) {
        await render(<Toast tone={tone}>Code sent to alex@example.tw</Toast>);
      }
      await render(
        <Toast tone="danger" action="Retry" onAction={() => {}}>
          Couldn&apos;t reach the server
        </Toast>
      );
    });
  });

  it("renders the message text", async () => {
    const { getByText } = await render(<Toast>Signed in as Alex L.</Toast>);
    expect(getByText("Signed in as Alex L.")).toBeTruthy();
  });

  it("omits the action when none is given", async () => {
    const { queryByText } = await render(<Toast>Signed in as Alex L.</Toast>);
    expect(queryByText("Retry")).toBeNull();
  });

  it("calls onAction when the action is pressed", async () => {
    const onAction = jest.fn();
    const { getByText } = await render(
      <Toast action="Retry" onAction={onAction}>
        Couldn&apos;t reach the server
      </Toast>
    );
    await fireEvent.press(getByText("Retry"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
