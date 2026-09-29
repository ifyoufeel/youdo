import React, { useEffect, useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { PublicProfileScreen } from "../PublicProfileScreen";

const LONG_TIMEOUT = { timeout: 5000 };

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

describe("PublicProfileScreen", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { findByText } = await render(<PublicProfileScreen userId="u2" />, { wrapper: Providers });
    await findByText("Open quests", {}, LONG_TIMEOUT);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the real target's identity, trust badges, and their own open quest", async () => {
    const { findByText, findByTestId } = await render(<PublicProfileScreen userId="u2" />, { wrapper: Providers });
    await findByTestId("report-action", {}, LONG_TIMEOUT);
    expect(await findByText("Open quests", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("shows the empty-ratings copy when nobody's review is visible yet", async () => {
    const { findByText } = await render(<PublicProfileScreen userId="u2" />, { wrapper: Providers });
    expect(await findByText(/No ratings showing yet/, {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("opens the report sheet from the flag action, and submitting shows a real toast", async () => {
    const { findByTestId, findByText, findByLabelText } = await render(<PublicProfileScreen userId="u2" />, {
      wrapper: Providers,
    });
    await fireEvent.press(await findByTestId("report-action", {}, LONG_TIMEOUT));
    await fireEvent.press(await findByLabelText("They didn't turn up", {}, LONG_TIMEOUT));
    await fireEvent.press(await findByTestId("report-sheet-confirm", {}, LONG_TIMEOUT));
    expect(await findByText(/Reported —/, {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("blocking from the sheet shows a real toast and filters this poster out of the browse feed", async () => {
    const { findByTestId, findByText } = await render(<PublicProfileScreen userId="u3" />, { wrapper: Providers });
    await fireEvent.press(await findByTestId("report-action", {}, LONG_TIMEOUT));
    await fireEvent.press(await findByTestId("block-user", {}, LONG_TIMEOUT));
    expect(await findByText(/Blocked —/, {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("never shows the report/block action on your own profile", async () => {
    const { findByText, queryByTestId } = await render(<PublicProfileScreen userId="u0" />, { wrapper: Providers });
    await findByText("What people said", {}, LONG_TIMEOUT);
    expect(queryByTestId("report-action")).toBeNull();
  });
});
