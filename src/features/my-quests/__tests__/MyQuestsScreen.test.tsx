import React, { useEffect } from "react";
import { render, fireEvent, waitFor, within } from "@testing-library/react-native";
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

  it(
    "shows the real per-tab counts",
    async () => {
      const { findByText, findByLabelText } = await render(<MyQuestsScreen />, { wrapper: Providers });
      await findByText("My quests", {}, LONG_TIMEOUT);
      // Active now includes q8 (paid, but u0 hasn't rated u2 back yet —
      // bucketOf's M6 carve-out) alongside q1/q11/q6/q7 = 5. Offers (q3)
      // and Done (q9 only — q8 moved out) are 1 each. Scoped to each
      // tab's own Pressable (accessibilityLabel = its plain-text label,
      // "Active"/"Offers"/"Done") since a bare digit like "5" or "1" isn't
      // unique across the whole screen (engagement cards show numbers
      // too).
      await waitFor(async () => {
        expect(within(await findByLabelText("Active")).getByText("5")).toBeTruthy();
        expect(within(await findByLabelText("Offers")).getByText("1")).toBeTruthy();
        expect(within(await findByLabelText("Done")).getByText("1")).toBeTruthy();
      }, LONG_TIMEOUT);
    },
    15000
  );

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
    // q8 (also paid) stays in Active until u0 rates u2 back — bucketOf's
    // M6 carve-out — so q9 is Done's one real engagement here.
    expect(await findByText("Take a suitcase to Taipei Main Station", {}, LONG_TIMEOUT)).toBeTruthy();
    expect(queryByText("Confirm and pay")).toBeNull();
    expect(queryByText("Leave a rating")).toBeNull();
  });
});
