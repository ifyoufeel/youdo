import React, { useEffect } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider } from "@data/auth-session";
import { OnboardingProvider, useOnboardingDraft } from "../OnboardingContext";
import CodeScreen from "../CodeScreen";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace }),
}));

function SeedContact({ contact }: { contact: string }) {
  const draft = useOnboardingDraft();
  useEffect(() => {
    draft.setContact(contact);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RepositoryProvider>
      <AuthSessionProvider>
        <OnboardingProvider>
          <SeedContact contact="alex@example.tw" />
          {children}
        </OnboardingProvider>
      </AuthSessionProvider>
    </RepositoryProvider>
  );
}

describe("CodeScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
    mockReplace.mockClear();
  });

  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<CodeScreen />, { wrapper: Providers });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the contact in the body copy", async () => {
    const { getByText } = await render(<CodeScreen />, { wrapper: Providers });
    expect(getByText("We sent a 6-digit code to alex@example.tw.")).toBeTruthy();
  });

  it("shows an error for a code shorter than 6 digits", async () => {
    const { getByTestId, getByText } = await render(<CodeScreen />, { wrapper: Providers });
    await fireEvent.changeText(getByTestId("code-input"), "123");
    await fireEvent.press(getByTestId("code-verify"));
    expect(getByText("Enter all 6 digits")).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("shows the wrong-code error and clears the field for '000000'", async () => {
    const { getByTestId, getByText } = await render(<CodeScreen />, { wrapper: Providers });
    await fireEvent.changeText(getByTestId("code-input"), "000000");
    await fireEvent.press(getByTestId("code-verify"));
    await waitFor(() => expect(getByText("That code didn't match — check your messages and try again")).toBeTruthy());
    expect(getByTestId("code-input").props.value).toBe("");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("verifies a valid code and replaces to /", async () => {
    const { getByTestId } = await render(<CodeScreen />, { wrapper: Providers });
    await fireEvent.changeText(getByTestId("code-input"), "123456");
    await fireEvent.press(getByTestId("code-verify"));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
  });

  it("resend clears the code and any error", async () => {
    const { getByTestId, queryByText } = await render(<CodeScreen />, { wrapper: Providers });
    await fireEvent.changeText(getByTestId("code-input"), "123");
    await fireEvent.press(getByTestId("code-verify"));
    await fireEvent.press(getByTestId("code-resend"));
    await waitFor(() => expect(getByTestId("code-input").props.value).toBe(""));
    expect(queryByText("Enter all 6 digits")).toBeNull();
  });
});
