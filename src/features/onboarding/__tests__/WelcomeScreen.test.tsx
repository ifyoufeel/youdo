import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import WelcomeScreen from "../WelcomeScreen";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}));

describe("WelcomeScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<WelcomeScreen />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("renders the pitch copy for both sides of the marketplace", async () => {
    const { getByText } = await render(<WelcomeScreen />);
    expect(getByText("Small jobs, done by neighbours")).toBeTruthy();
    expect(getByText("Need something done")).toBeTruthy();
    expect(getByText("Have a free hour")).toBeTruthy();
  });

  it("navigates to location on Get started", async () => {
    const { getByText } = await render(<WelcomeScreen />);
    await fireEvent.press(getByText("Get started"));
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/location");
  });
});
