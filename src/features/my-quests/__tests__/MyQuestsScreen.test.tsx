import React, { useEffect } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { MyQuestsScreen } from "../MyQuestsScreen";

const LONG_TIMEOUT = { timeout: 5000 };

// Mirrors app/index.tsx's real cold-start gate — same fix M2/M3's other
// screen tests already needed (a screen never sees a signed-out session
// in production; a test harness racing sign-in against render can).
function SignInOnMount({ children }: { children: React.ReactNode }) {
  const { status, signInWithGoogle } = useAuthSession();
  useEffect(() => {
    if (status === "signedOut") signInWithGoogle();
  }, [status, signInWithGoogle]);
  if (status !== "signedIn") return null;
  return <>{children}</>;
}

function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
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

describe("MyQuestsScreen", () => {
  it("renders the Active tab by default, with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { findByText } = await render(<MyQuestsScreen />, { wrapper: Providers });

    await findByText("My quests", {}, LONG_TIMEOUT);
    expect(await findByText("Drop two bags at the recycling point", {}, LONG_TIMEOUT)).toBeTruthy();

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the real per-tab counts", async () => {
    const { findByText } = await render(<MyQuestsScreen />, { wrapper: Providers });
    await findByText("My quests", {}, LONG_TIMEOUT);
    expect(await findByText("3", {}, LONG_TIMEOUT)).toBeTruthy(); // Active
    expect(await findByText("1", {}, LONG_TIMEOUT)).toBeTruthy(); // Offers
    expect(await findByText("2", {}, LONG_TIMEOUT)).toBeTruthy(); // Done
  });

  it("switches to the Offers tab and shows the applicant's engagement", async () => {
    const { findByText } = await render(<MyQuestsScreen />, { wrapper: Providers });
    await findByText("My quests", {}, LONG_TIMEOUT);
    await fireEvent.press(await findByText("Offers", {}, LONG_TIMEOUT));
    expect(await findByText("Assemble a wardrobe (2 boxes)", {}, LONG_TIMEOUT)).toBeTruthy();
    expect(await findByText("Offer sent", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it("switches to the Done tab and shows closed engagements, no dead action buttons", async () => {
    const { findByText, queryByText } = await render(<MyQuestsScreen />, { wrapper: Providers });
    await findByText("My quests", {}, LONG_TIMEOUT);
    await fireEvent.press(await findByText("Done", {}, LONG_TIMEOUT));
    expect(await findByText("Queue for the new bakery on Dihua St", {}, LONG_TIMEOUT)).toBeTruthy();
    expect(queryByText("Confirm and pay")).toBeNull();
    expect(queryByText("Leave a rating")).toBeNull();
  });
});
