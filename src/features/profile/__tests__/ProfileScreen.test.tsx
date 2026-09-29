import React, { useEffect, useState } from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { flushSettlementsForTests } from "@data/adapters/memory/payment-settlement";
import { ProfileScreen } from "../ProfileScreen";

const LONG_TIMEOUT = { timeout: 5000 };

// Mirrors QuestDetailScreen.test.tsx's own SignInOnMount — a screen
// behind auth never mounts until status is "signedIn", matching
// production's cold-start gate rather than racing it.
function SignInOnMount({ children }: { children: React.ReactNode }) {
  const { status, signInWithGoogle } = useAuthSession();
  useEffect(() => {
    if (status === "signedOut") signInWithGoogle();
  }, [status, signInWithGoogle]);
  if (status !== "signedIn") return null;
  return <>{children}</>;
}

function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>
        <AuthSessionProvider>
          <SignInOnMount>{children}</SignInOnMount>
        </AuthSessionProvider>
      </RepositoryProvider>
    </QueryClientProvider>
  );
}

describe("ProfileScreen", () => {
  afterEach(() => {
    flushSettlementsForTests();
  });

  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { findByText } = await render(<ProfileScreen />, { wrapper: Providers });
    await findByText("Alex L.", {}, LONG_TIMEOUT);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows u0's real identity and available balance", async () => {
    const { findByText } = await render(<ProfileScreen />, { wrapper: Providers });
    expect(await findByText("Alex L.", {}, LONG_TIMEOUT)).toBeTruthy();
    expect(await findByText("NT$5,355", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("shows the real seeded wallet history rows", async () => {
    const { findByText } = await render(<ProfileScreen />, { wrapper: Providers });
    expect(await findByText("Cash out to CTBC •••• 4417", {}, LONG_TIMEOUT)).toBeTruthy();
    expect(await findByText("Opening balance", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("a deposit round-trips through pending to settled, updating the headline", async () => {
    const { findByText, findByTestId, getByText } = await render(<ProfileScreen />, { wrapper: Providers });
    await findByText("NT$5,355", {}, LONG_TIMEOUT);

    await fireEvent.press(await findByTestId("profile-wallet-card-add", {}, LONG_TIMEOUT));
    await fireEvent.press(getByText("NT$500"));
    await fireEvent.press(getByText("Add to wallet"));

    await waitFor(() => expect(getByText("Adding NT$500…")).toBeTruthy(), LONG_TIMEOUT);

    await act(async () => {
      flushSettlementsForTests();
    });

    await findByText("NT$5,855", {}, LONG_TIMEOUT);
  });

  it(
    "opens Settings from the TopBar action and commits a real phone edit on Done",
    async () => {
      const { findByTestId, findByText, getByTestId } = await render(<ProfileScreen />, { wrapper: Providers });
      await findByText("Alex L.", {}, LONG_TIMEOUT);

      await fireEvent.press(await findByTestId("open-settings", {}, LONG_TIMEOUT));
      await findByTestId("settings-sheet", {}, LONG_TIMEOUT);
      await fireEvent.changeText(getByTestId("settings-phone"), "+886 900 111 222");
      await fireEvent.press(getByTestId("settings-done"));

      // The updateProfile mutation's onSuccess writes straight into the
      // ["users", userId] cache ProfileScreen's own userQuery reads, so
      // the real, persisted change is checkable by reopening the sheet
      // and reading the field's real value, not just that a toast
      // appeared.
      await fireEvent.press(await findByTestId("open-settings", {}, LONG_TIMEOUT));
      await waitFor(() => expect(getByTestId("settings-phone").props.value).toBe("+886 900 111 222"), LONG_TIMEOUT);
    },
    15000
  );
});
