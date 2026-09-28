import React, { useEffect, useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { ledger as ledgerStore } from "@data/adapters/memory/store";
import { nowIso } from "@data/adapters/memory/clock";
import { OfferInboxScreen } from "../OfferInboxScreen";

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

describe("OfferInboxScreen", () => {
  it("renders q6's three pending offers with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { findByText } = await render(<OfferInboxScreen questId="q6" />, { wrapper: Providers });

    await findByText("3 offers waiting", {}, LONG_TIMEOUT);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it(
    "shows a real wallet-balance row now that LedgerPort is real (M5)",
    async () => {
      const { findByText } = await render(<OfferInboxScreen questId="q6" />, { wrapper: Providers });
      await findByText("3 offers waiting", {}, LONG_TIMEOUT);
      // u0 (q6's poster) — real seeded available balance.
      expect(await findByText("NT$5,355", {}, LONG_TIMEOUT)).toBeTruthy();
    },
    15000
  );

  it(
    "disables Hold-and-accept and shows a shortfall warning + prefilled Add-money sheet when short",
    async () => {
      // Whitebox: drain u0's available well below o10's 25000 amount, same
      // direct-ledger-push technique the adapter suite's own forceHold
      // uses — this test only needs a below-offer balance, not a balanced
      // transaction, so a single debit entry is enough.
      const snapshot = ledgerStore.length;
      ledgerStore.push({
        id: "test-drain-1",
        txnId: "test-drain-1",
        account: "user_available",
        userId: "u0",
        questId: null,
        amountMinor: -520000,
        at: nowIso(),
        memo: "test drain",
      });

      try {
        const { findByText, findByTestId, getByText, getByTestId } = await render(<OfferInboxScreen questId="q6" />, {
          wrapper: Providers,
        });
        await findByText("3 offers waiting", {}, LONG_TIMEOUT);

        await fireEvent.press(await findByTestId("offer-row-o10-accept", {}, LONG_TIMEOUT));
        expect(await findByText("Add NT$95 to your wallet and you can hold this offer.", {}, LONG_TIMEOUT)).toBeTruthy();
        expect(getByTestId("accept-offer-submit").props.accessibilityState.disabled).toBe(true);

        await fireEvent.press(getByText("Add money"));
        expect(getByTestId("deposit-amount").props.value).toBe("95");
      } finally {
        ledgerStore.length = snapshot;
      }
    },
    15000
  );

  it(
    "shows only the decided list once every offer has been answered",
    async () => {
      // q8: posterId u2, offers already resolved (o8 accepted, o13 declined).
      const { findByText, queryByText } = await render(<OfferInboxScreen questId="q8" />, { wrapper: Providers });
      await findByText("Already answered", {}, LONG_TIMEOUT);
      expect(queryByText("No offers left to decide — the rest have been answered.")).toBeTruthy();
    },
    15000
  );

  it(
    "accepting an offer moves it to decided and auto-declines the rest",
    async () => {
      const { findByText, findByTestId, getByText } = await render(<OfferInboxScreen questId="q6" />, {
        wrapper: Providers,
      });
      await findByText("3 offers waiting", {}, LONG_TIMEOUT);

      await fireEvent.press(await findByTestId("offer-row-o10-accept", {}, LONG_TIMEOUT));
      expect(await findByText("Accept this offer", {}, LONG_TIMEOUT)).toBeTruthy();
      expect(getByText(/other 2 offers are declined automatically/)).toBeTruthy();

      await fireEvent.press(getByText("Hold and accept"));

      await findByText("Already answered", {}, LONG_TIMEOUT);
      expect(await findByText("No offers left to decide — the rest have been answered.", {}, LONG_TIMEOUT)).toBeTruthy();
    },
    15000
  );

  it(
    "declining an offer removes it from the pending list",
    async () => {
      const { findByText, findByTestId, queryByText } = await render(<OfferInboxScreen questId="q4" />, {
        wrapper: Providers,
      });
      await findByText(/offer waiting/, {}, LONG_TIMEOUT);

      await fireEvent.press(await findByTestId("offer-row-o5-decline", {}, LONG_TIMEOUT));

      await findByText("Already answered", {}, LONG_TIMEOUT);
      expect(queryByText(/offer waiting/)).toBeNull();
    },
    15000
  );
});
