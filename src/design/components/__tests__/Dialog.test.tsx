import { render, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";
import { Dialog } from "../Dialog";

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

describe("Dialog", () => {
  it("renders both variants, with title/subtitle/actions, with no console warnings/errors", async () => {
    await withSpies(async () => {
      await render(
        <Dialog open title="Sort and filter" subtitle="5 quests nearby" onClose={() => {}}>
          <Text>Body</Text>
        </Dialog>
      );
      await render(
        <Dialog open variant="default" title="Confirm" actions={<Text>Actions</Text>}>
          <Text>Body</Text>
        </Dialog>
      );
    });
  });

  it("renders nothing when closed", async () => {
    const { queryByText } = await render(
      <Dialog open={false} title="Sort and filter">
        <Text>Body content</Text>
      </Dialog>
    );
    expect(queryByText("Body content")).toBeNull();
  });

  it("renders children when open", async () => {
    const { getByText } = await render(
      <Dialog open title="Sort and filter">
        <Text>Body content</Text>
      </Dialog>
    );
    expect(getByText("Body content")).toBeTruthy();
  });

  it("calls onClose when the backdrop is pressed", async () => {
    const onClose = jest.fn();
    const { getByTestId } = await render(
      <Dialog open onClose={onClose} testID="dlg">
        <Text>Body</Text>
      </Dialog>
    );
    await fireEvent.press(getByTestId("dlg-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when the card content is pressed", async () => {
    const onClose = jest.fn();
    const { getByTestId } = await render(
      <Dialog open onClose={onClose} testID="dlg">
        <Text>Body</Text>
      </Dialog>
    );
    await fireEvent.press(getByTestId("dlg"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when the Close button is pressed", async () => {
    const onClose = jest.fn();
    const { getByLabelText } = await render(
      <Dialog open title="Sort and filter" onClose={onClose}>
        <Text>Body</Text>
      </Dialog>
    );
    await fireEvent.press(getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("omits the Close button when onClose is not given", async () => {
    const { queryByLabelText } = await render(
      <Dialog open title="Sort and filter">
        <Text>Body</Text>
      </Dialog>
    );
    expect(queryByLabelText("Close")).toBeNull();
  });
});
