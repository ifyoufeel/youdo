import { createSupabaseLedgerPort } from "../ledger";
import { createFakeClient, fakeOk, fakeError } from "../test-support/fake-client";
import { flushSettlementsForTests } from "../payment-settlement";

const mockState: { client: ReturnType<typeof createFakeClient>["client"] } = { client: createFakeClient().client };
jest.mock("../client", () => ({ supabase: () => mockState.client }));

const ENTRY_ROW = {
  id: "le1",
  txn_id: "tx-hold-1",
  account: "user_held" as const,
  user_id: "u0",
  quest_id: "q1",
  amount_minor: 40000,
  at: "2026-09-16T02:00:00.000Z",
  memo: "Held for a quest",
};

const PAYMENT_ROW = {
  id: "pay1",
  txn_id: "tx-topup-1",
  kind: "deposit" as const,
  user_id: "u0",
  amount_minor: 50000,
  state: "pending" as const,
  provider: "simulated" as const,
  provider_id: "sim-1",
  created_at: "2026-09-16T02:00:00.000Z",
  settled_at: null,
};

afterEach(() => {
  flushSettlementsForTests();
});

describe("supabase ledger port (mocked client — no live project)", () => {
  it("listEntriesForUser reads ledger_entries scoped by user_id", async () => {
    const { client, calls } = createFakeClient([fakeOk([ENTRY_ROW])]);
    mockState.client = client;

    const entries = await createSupabaseLedgerPort().listEntriesForUser("u0");

    expect(entries).toEqual([
      { id: "le1", txnId: "tx-hold-1", account: "user_held", userId: "u0", questId: "q1", amountMinor: 40000, at: ENTRY_ROW.at, memo: "Held for a quest" },
    ]);
    expect(calls.some((c) => c.method === "eq" && c.params[0] === "user_id" && c.params[1] === "u0")).toBe(true);
  });

  it("balanceOf sums amount_minor client-side over the RLS-scoped rows", async () => {
    const { client, calls } = createFakeClient([fakeOk([{ amount_minor: 535500 }, { amount_minor: 20000 }])]);
    mockState.client = client;

    const balance = await createSupabaseLedgerPort().balanceOf("u0", "user_available");

    expect(balance).toBe(555500);
    expect(calls.some((c) => c.method === "eq" && c.params[0] === "account" && c.params[1] === "user_available")).toBe(
      true
    );
  });

  it("listPaymentsForUser orders newest first", async () => {
    const { client, calls } = createFakeClient([fakeOk([PAYMENT_ROW])]);
    mockState.client = client;

    const payments = await createSupabaseLedgerPort().listPaymentsForUser("u0");

    expect(payments[0].id).toBe("pay1");
    expect(calls.some((c) => c.method === "order" && c.params[0] === "created_at")).toBe(true);
  });

  it("deposit calls the deposit RPC and returns the pending Payment immediately", async () => {
    const { client, calls } = createFakeClient([fakeOk(PAYMENT_ROW)]);
    mockState.client = client;

    const payment = await createSupabaseLedgerPort().deposit("u0", 50000, { idempotencyKey: "k-1" });

    expect(payment.state).toBe("pending");
    expect(calls[0]).toMatchObject({ rpc: "deposit", args: { p_amount_minor: 50000, p_idempotency_key: "k-1" } });
  });

  it("deposit schedules a settle_payment RPC call, not applied until flushed", async () => {
    const { client: depositClient } = createFakeClient([fakeOk(PAYMENT_ROW)]);
    mockState.client = depositClient;
    await createSupabaseLedgerPort().deposit("u0", 50000, { idempotencyKey: "k-1" });

    const { client: settleClient, calls: settleCalls } = createFakeClient([fakeOk(null)]);
    mockState.client = settleClient;

    await Promise.all(flushSettlementsForTests());

    expect(settleCalls[0]).toMatchObject({ rpc: "settle_payment", args: { p_payment_id: "pay1" } });
  });

  it("cashOut calls the cash_out RPC and schedules settlement the same way", async () => {
    const cashoutRow = { ...PAYMENT_ROW, id: "pay2", txn_id: "tx-cash-1", kind: "cashout" as const };
    const { client, calls } = createFakeClient([fakeOk(cashoutRow)]);
    mockState.client = client;

    const payment = await createSupabaseLedgerPort().cashOut("u0", 10000, { idempotencyKey: "k-2" });

    expect(payment.kind).toBe("cashout");
    expect(calls[0]).toMatchObject({ rpc: "cash_out", args: { p_amount_minor: 10000, p_idempotency_key: "k-2" } });
  });

  it("propagates a cash_out guard rejection (e.g. insufficient spendable balance)", async () => {
    const { client } = createFakeClient([fakeError("Cash out an amount you have available")]);
    mockState.client = client;
    await expect(
      createSupabaseLedgerPort().cashOut("u0", 999999999, { idempotencyKey: "k" })
    ).rejects.toBeTruthy();
  });
});
