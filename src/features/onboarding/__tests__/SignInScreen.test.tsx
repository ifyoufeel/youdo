import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider } from "@data/auth-session";
import SignInScreen from "../SignInScreen";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace }),
}));

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RepositoryProvider>
      <AuthSessionProvider>{children}</AuthSessionProvider>
    </RepositoryProvider>
  );
}

describe("SignInScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
    mockReplace.mockClear();
  });

  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<SignInScreen />, { wrapper: Providers });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("navigates to contact on 'Use a code instead'", async () => {
    const { getByTestId } = await render(<SignInScreen />, { wrapper: Providers });
    await fireEvent.press(getByTestId("signin-use-code"));
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/contact");
  });

  it("shows a loading state while Google sign-in is in flight, then replaces to /", async () => {
    const { getByTestId, getByText, queryByTestId } = await render(<SignInScreen />, { wrapper: Providers });
    // Not awaited: the memory adapter's simulated latency (120-400ms)
    // keeps this pending, giving the loading state a real window to
    // observe before it resolves.
    fireEvent.press(getByTestId("signin-google"));
    await waitFor(() => expect(getByText("Signing in with Google…")).toBeTruthy());
    expect(queryByTestId("signin-google")).toBeNull();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
  });

  it("calls router.back when the TopBar back button is pressed", async () => {
    const { getByLabelText } = await render(<SignInScreen />, { wrapper: Providers });
    await fireEvent.press(getByLabelText("Back"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
