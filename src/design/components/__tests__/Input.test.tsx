import { render, fireEvent } from "@testing-library/react-native";
import { Input } from "../Input";

describe("Input", () => {
  it("renders label/hint/error/icon/prefix/suffix/multiline/disabled with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<Input label="Email" value="" onChangeText={() => {}} icon="send" placeholder="you@example.com" />);
    await render(<Input label="Email" value="" onChangeText={() => {}} hint="We'll never share this" />);
    await render(<Input label="Email" value="" onChangeText={() => {}} error="Add a working email" />);
    await render(<Input label="Price" value="" onChangeText={() => {}} prefix="NT$" suffix="/ quest" />);
    await render(<Input label="Details" value="" onChangeText={() => {}} multiline rows={4} />);
    await render(<Input label="Email" value="" onChangeText={() => {}} disabled />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders the label and current value", async () => {
    const { getByText, getByDisplayValue } = await render(
      <Input label="Email" value="alex@example.tw" onChangeText={() => {}} />
    );
    expect(getByText("Email")).toBeTruthy();
    expect(getByDisplayValue("alex@example.tw")).toBeTruthy();
  });

  it("calls onChangeText as the user types", async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <Input label="Email" value="" onChangeText={onChangeText} testID="input" />
    );
    fireEvent.changeText(getByTestId("input"), "alex@example.tw");
    expect(onChangeText).toHaveBeenCalledWith("alex@example.tw");
  });

  it("renders the error message, not the hint, when both are given", async () => {
    const { getByText, queryByText } = await render(
      <Input label="Email" value="" onChangeText={() => {}} hint="We'll text or email a code" error="Add a working email" />
    );
    expect(getByText("Add a working email")).toBeTruthy();
    expect(queryByText("We'll text or email a code")).toBeNull();
  });

  it("passes keyboardType and maxLength through to the underlying TextInput", async () => {
    const { getByTestId } = await render(
      <Input
        label="6-digit code"
        value=""
        onChangeText={() => {}}
        keyboardType="number-pad"
        maxLength={6}
        testID="input"
      />
    );
    const field = getByTestId("input");
    expect(field.props.keyboardType).toBe("number-pad");
    expect(field.props.maxLength).toBe(6);
  });
});
