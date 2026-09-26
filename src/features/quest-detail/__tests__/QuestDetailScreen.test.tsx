import React, { useEffect, useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { QuestDetailScreen } from "../QuestDetailScreen";

const LONG_TIMEOUT = { timeout: 5000 };

// Mirrors app/index.tsx's real cold-start gate: a screen behind auth
// never mounts until status is "signedIn", so children only render once
// sign-in actually resolves — matching production, not just racing it.
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

describe("QuestDetailScreen", () => {
  it("renders a visitor's view with no console warnings/errors, offering CTAs and a hidden address", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { findByText, queryByText } = await render(<QuestDetailScreen questId="q2" />, { wrapper: Providers });

    await findByText("Ask", {}, LONG_TIMEOUT);
    expect(await findByText("Take this quest", {}, LONG_TIMEOUT)).toBeTruthy();
    expect(queryByText(/the exact address is shared/i)).toBeTruthy();

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the poster's own view: an offer count, no offer CTAs", async () => {
    const { findByText, queryByText } = await render(<QuestDetailScreen questId="q6" />, { wrapper: Providers });
    await findByText(/3 offers/, {}, LONG_TIMEOUT);
    expect(queryByText("Take this quest")).toBeNull();
    expect(queryByText("Ask")).toBeNull();
  });

  it("shows an applicant's own offer with a real withdraw action", async () => {
    const { findByText, findByTestId } = await render(<QuestDetailScreen questId="q3" />, { wrapper: Providers });
    await findByText(/Your offer: NT\$1,050/, {}, LONG_TIMEOUT);
    expect(await findByTestId("withdraw-offer", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it(
    "reveals the address to the accepted doer once the quest has left open",
    async () => {
      // The title legitimately appears twice — once in TopBar, once in the
      // body's header card, matching the prototype's own layout — so this
      // waits on a piece of body content that's only ever rendered once.
      // It also waits on role-dependent content ("Doing this quest"),
      // since role/addressVisible both derive from the offers query, which
      // can resolve after the quest query that the meta rows depend on.
      const { findByText, queryByText } = await render(<QuestDetailScreen questId="q1" />, { wrapper: Providers });
      await findByText("~60 min", {}, LONG_TIMEOUT);
      await findByText("Doing this quest", {}, LONG_TIMEOUT);
      expect(queryByText(/the exact address is shared/i)).toBeNull();
    },
    15000
  );

  it(
    "sending an offer shows a confirmation toast carrying the poster's real name",
    async () => {
      const { findByText, findByTestId } = await render(<QuestDetailScreen questId="q4" />, { wrapper: Providers });
      await findByText("Ask", {}, LONG_TIMEOUT);

      await fireEvent.press(await findByText("Ask", {}, LONG_TIMEOUT));
      await findByTestId("offer-sheet", {}, LONG_TIMEOUT);
      await fireEvent.press(await findByTestId("offer-submit", {}, LONG_TIMEOUT));

      expect(await findByText(/Offer sent to/, {}, LONG_TIMEOUT)).toBeTruthy();
    },
    15000
  );
});
