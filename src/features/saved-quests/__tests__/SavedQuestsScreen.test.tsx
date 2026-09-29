import React, { useEffect, useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { SavedQuestsScreen } from "../SavedQuestsScreen";

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

describe("SavedQuestsScreen", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { findByText } = await render(<SavedQuestsScreen />, { wrapper: Providers });
    await findByText("Help carry a sofa down two floors", {}, LONG_TIMEOUT);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows u0's real seeded saved quest (q4) with its poster's trust info", async () => {
    const { findByText } = await render(<SavedQuestsScreen />, { wrapper: Providers });
    expect(await findByText("Help carry a sofa down two floors", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("unsaving from the card removes it from the list", async () => {
    const { findByText, findByLabelText, queryByText } = await render(<SavedQuestsScreen />, { wrapper: Providers });
    await findByText("Help carry a sofa down two floors", {}, LONG_TIMEOUT);
    await fireEvent.press(await findByLabelText("Save quest", {}, LONG_TIMEOUT));
    await findByText(/Nothing saved yet/, {}, LONG_TIMEOUT);
    expect(queryByText("Help carry a sofa down two floors")).toBeNull();
  });
});
