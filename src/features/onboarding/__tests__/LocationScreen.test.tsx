import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LocationScreen from "../LocationScreen";

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn() }),
}));

const mockRequestForegroundPermissionsAsync = jest.fn();
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) => mockRequestForegroundPermissionsAsync(...args),
}));

describe("LocationScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
    mockRequestForegroundPermissionsAsync.mockClear();
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
  });

  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<LocationScreen />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("requests the real OS permission and navigates to sign-in on Allow", async () => {
    const { getByTestId } = await render(<LocationScreen />);
    await fireEvent.press(getByTestId("location-allow"));
    await waitFor(() => expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1));
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/signin");
  });

  it("navigates to sign-in on Not now, without requesting permission", async () => {
    const { getByTestId } = await render(<LocationScreen />);
    await fireEvent.press(getByTestId("location-skip"));
    expect(mockRequestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/signin");
  });

  it("still navigates to sign-in even if the permission request rejects", async () => {
    mockRequestForegroundPermissionsAsync.mockRejectedValue(new Error("denied"));
    const { getByTestId } = await render(<LocationScreen />);
    await fireEvent.press(getByTestId("location-allow"));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/(onboarding)/signin"));
  });

  it("calls router.back when the TopBar back button is pressed", async () => {
    const { getByLabelText } = await render(<LocationScreen />);
    await fireEvent.press(getByLabelText("Back"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
