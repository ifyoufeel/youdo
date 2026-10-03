import React from "react";
import { render } from "@testing-library/react-native";
import { WalletHistory } from "../WalletHistory";
import type { WalletHistoryRow } from "../useWallet";
import type { Payment } from "@data/contracts";

const NOW = Date.parse("2026-09-16T09:00:00+08:00");

function payment(overrides: Partial<Payment>): Payment {
  return {
    id: "p1",
    txnId: "tx-p1",
    kind: "deposit",
    userId: "u0",
    amountMinor: 20000,
    state: "pending",
    provider: "simulated",
    providerId: "sim-1",
    createdAt: "2026-09-16T08:00:00+08:00",
    settledAt: null,
    ...overrides,
  };
}

// u0's real seeded rows (domain/ledger.ts's classifyWalletRow, verified
// against the fixture directly) — held (a debit, negative & unsigned
// green), paid_in (a credit), sent (a debit), added (a credit).
const HISTORY: WalletHistoryRow[] = [
  { txnId: "tx-q7-hold", at: "2026-09-13T12:35:00+08:00", memo: "Held for a quest", questId: "q7", kind: "held", amountMinor: -30000, signed: true },
  { txnId: "tx-q8-release", at: "2026-09-13T12:00:00+08:00", memo: "Quest paid", questId: "q8", kind: "paid_in", amountMinor: 31500, signed: true },
  { txnId: "tx-cash-1", at: "2026-09-10T16:00:00+08:00", memo: "Cash out to CTBC •••• 4417", questId: null, kind: "sent", amountMinor: -150000, signed: true },
  { txnId: "tx-open", at: "2025-11-04T10:00:00+08:00", memo: "Opening balance", questId: null, kind: "added", amountMinor: 684000, signed: true },
];

describe("WalletHistory", () => {
  it("renders with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(<WalletHistory history={HISTORY} pendingPayments={[]} failedPayments={[]} now={NOW} />);
    await render(<WalletHistory history={[]} pendingPayments={[payment({})]} failedPayments={[payment({ state: "failed", kind: "cashout" })]} now={NOW} />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the empty state when there is nothing at all", async () => {
    const { getByText } = await render(<WalletHistory history={[]} pendingPayments={[]} failedPayments={[]} now={NOW} />);
    expect(getByText("No activity yet — your first payout lands here.")).toBeTruthy();
  });

  it("renders a signed credit with a plus and the kind badge", async () => {
    const { getByText } = await render(
      <WalletHistory history={[HISTORY[1]]} pendingPayments={[]} failedPayments={[]} now={NOW} />
    );
    expect(getByText("+NT$315")).toBeTruthy();
    expect(getByText("Paid in")).toBeTruthy();
  });

  it("renders a debit (held) without a plus sign", async () => {
    const { getByText, queryByText } = await render(
      <WalletHistory history={[HISTORY[0]]} pendingPayments={[]} failedPayments={[]} now={NOW} />
    );
    expect(getByText("−NT$300")).toBeTruthy();
    expect(queryByText("+−NT$300")).toBeNull();
    expect(getByText("Held")).toBeTruthy();
  });

  it("falls back to the ledger memo when no title resolver is given", async () => {
    const { getByText } = await render(
      <WalletHistory history={[HISTORY[2]]} pendingPayments={[]} failedPayments={[]} now={NOW} />
    );
    expect(getByText("Cash out to CTBC •••• 4417")).toBeTruthy();
  });

  it("uses resolveTitle when it returns a quest title", async () => {
    const { getByText } = await render(
      <WalletHistory
        history={[HISTORY[1]]}
        pendingPayments={[]}
        failedPayments={[]}
        now={NOW}
        resolveTitle={(questId) => (questId === "q8" ? "Fix a leaky tap" : null)}
      />
    );
    expect(getByText("Fix a leaky tap")).toBeTruthy();
  });

  it("shows pending payments before the ledger history, with an amount", async () => {
    const { getByText } = await render(
      <WalletHistory history={HISTORY} pendingPayments={[payment({ amountMinor: 50000, kind: "deposit" })]} failedPayments={[]} now={NOW} />
    );
    expect(getByText("Adding NT$500…")).toBeTruthy();
  });

  it("shows failed payments", async () => {
    const { getByText } = await render(
      <WalletHistory history={[]} pendingPayments={[]} failedPayments={[payment({ state: "failed", kind: "cashout", amountMinor: 10000 })]} now={NOW} />
    );
    expect(getByText("NT$100 cash-out didn't go through")).toBeTruthy();
  });
});
