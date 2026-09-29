import { render, fireEvent } from "@testing-library/react-native";
import { DeleteAccountDialog } from "../DeleteAccountDialog";

describe("DeleteAccountDialog", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<DeleteAccountDialog open onClose={() => {}} onConfirm={() => {}} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("calls onConfirm when the delete action is pressed", async () => {
    const onConfirm = jest.fn();
    const { getByTestId } = await render(<DeleteAccountDialog open onClose={() => {}} onConfirm={onConfirm} />);
    await fireEvent.press(getByTestId("delete-account-confirm"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onClose when Keep my account is pressed", async () => {
    const onClose = jest.fn();
    const { getByText } = await render(<DeleteAccountDialog open onClose={onClose} onConfirm={() => {}} />);
    await fireEvent.press(getByText("Keep my account"));
    expect(onClose).toHaveBeenCalled();
  });

  it("disables the confirm action while submitting", async () => {
    const { getByTestId } = await render(<DeleteAccountDialog open onClose={() => {}} onConfirm={() => {}} submitting />);
    expect(getByTestId("delete-account-confirm").props.accessibilityState.disabled).toBe(true);
  });
});
