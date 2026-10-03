import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider } from "@data/auth-session";
import { OnboardingProvider } from "../OnboardingContext";
import ContactScreen from "../ContactScreen";

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn() }),
}));

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RepositoryProvider>
      <AuthSessionProvider>
        <OnboardingProvider>{children}</OnboardingProvider>
      </AuthSessionProvider>
    </RepositoryProvider>
  );
}

describe("ContactScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<ContactScreen />, { wrapper: Providers });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows an error and does not navigate for an invalid email", async () => {
    const { getByTestId, getByText } = await render(<ContactScreen />, { wrapper: Providers });
    await fireEvent.changeText(getByTestId("contact-input"), "not-an-email");
    await fireEvent.press(getByTestId("contact-send"));
    expect(getByText("Add a working email to send the code")).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("sends the code and navigates for a valid email", async () => {
    const { getByTestId } = await render(<ContactScreen />, { wrapper: Providers });
    await fireEvent.changeText(getByTestId("contact-input"), "alex@example.tw");
    await fireEvent.press(getByTestId("contact-send"));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/(onboarding)/code"));
  });

  it("switches to the phone field and validates phone numbers", async () => {
    const { getByText, getByTestId, queryByText } = await render(<ContactScreen />, { wrapper: Providers });
    // Both the Tag and the now-relabeled Input say "Phone" once switched —
    // assert the switch behaviorally (phone validation kicks in below)
    // rather than re-querying the ambiguous text.
    await fireEvent.press(getByText("Phone"));

    await fireEvent.changeText(getByTestId("contact-input"), "123");
    await fireEvent.press(getByTestId("contact-send"));
    expect(getByText("Add a working phone number to send the code")).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();

    await fireEvent.changeText(getByTestId("contact-input"), "+886 912 345 678");
    await fireEvent.press(getByTestId("contact-send"));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/(onboarding)/code"));
    expect(queryByText("Add a working phone number to send the code")).toBeNull();
  });

  it("calls router.back for both the TopBar and Slab back buttons", async () => {
    const { getByLabelText, getByText } = await render(<ContactScreen />, { wrapper: Providers });
    await fireEvent.press(getByLabelText("Back"));
    expect(mockBack).toHaveBeenCalledTimes(1);
    await fireEvent.press(getByText("Back"));
    expect(mockBack).toHaveBeenCalledTimes(2);
  });
});
