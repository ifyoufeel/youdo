import {
  LedgerImbalanceError,
  stampTxn,
  balanceOf,
  heldForQuest,
  spendableOf,
  holdEntries,
  releaseEntries,
  refundEntries,
  depositEntries,
  cashOutEntries,
  walletRowsFor,
  classifyWalletRow,
} from "./ledger";
import type { LedgerEntry, Payment } from "../contracts";

// A hand-built subset of seed.ts's real ledger — domain/ can't import
// adapters/ directly (ADR-004), so this mirrors the exact real entries
// (same ids/amounts/timestamps) rather than importing the fixture.
const FIXTURE_LEDGER: LedgerEntry[] = [
  { id: "e1", txnId: "tx-open", account: "user_available", userId: "u0", questId: null, amountMinor: 684000, at: "2025-11-04T10:00:00+08:00", memo: "Opening balance" },
  { id: "e2", txnId: "tx-open", account: "external_bank", userId: "u0", questId: null, amountMinor: -684000, at: "2025-11-04T10:00:00+08:00", memo: "Opening balance" },
  { id: "e13", txnId: "tx-q8-hold", account: "user_available", userId: "u2", questId: "q8", amountMinor: -35000, at: "2026-09-12T10:50:00+08:00", memo: "Held for a quest" },
  { id: "e14", txnId: "tx-q8-hold", account: "user_held", userId: "u2", questId: "q8", amountMinor: 35000, at: "2026-09-12T10:50:00+08:00", memo: "Held for a quest" },
  { id: "e15", txnId: "tx-q8-release", account: "user_held", userId: "u2", questId: "q8", amountMinor: -35000, at: "2026-09-13T12:00:00+08:00", memo: "Released to the doer" },
  { id: "e16", txnId: "tx-q8-release", account: "user_available", userId: "u0", questId: "q8", amountMinor: 31500, at: "2026-09-13T12:00:00+08:00", memo: "Quest paid" },
  { id: "e17", txnId: "tx-q8-release", account: "platform_fee", userId: null, questId: "q8", amountMinor: 3500, at: "2026-09-13T12:00:00+08:00", memo: "Platform fee" },
  { id: "e22", txnId: "tx-q1-hold", account: "user_available", userId: "u1", questId: "q1", amountMinor: -40000, at: "2026-09-15T21:40:00+08:00", memo: "Held for a quest" },
  { id: "e23", txnId: "tx-q1-hold", account: "user_held", userId: "u1", questId: "q1", amountMinor: 40000, at: "2026-09-15T21:40:00+08:00", memo: "Held for a quest" },
  { id: "e24", txnId: "tx-q7-hold", account: "user_available", userId: "u0", questId: "q7", amountMinor: -30000, at: "2026-09-13T12:35:00+08:00", memo: "Held for a quest" },
  { id: "e25", txnId: "tx-q7-hold", account: "user_held", userId: "u0", questId: "q7", amountMinor: 30000, at: "2026-09-13T12:35:00+08:00", memo: "Held for a quest" },
  { id: "e26", txnId: "tx-cash-1", account: "user_available", userId: "u0", questId: null, amountMinor: -150000, at: "2026-09-10T16:00:00+08:00", memo: "Cash out to CTBC •••• 4417" },
  { id: "e27", txnId: "tx-cash-1", account: "external_bank", userId: "u0", questId: null, amountMinor: 150000, at: "2026-09-10T16:00:00+08:00", memo: "Cash out to CTBC •••• 4417" },
  { id: "e28", txnId: "tx-q11-hold", account: "user_available", userId: "u3", questId: "q11", amountMinor: -15000, at: "2026-09-15T22:30:00+08:00", memo: "Held for a quest" },
  { id: "e29", txnId: "tx-q11-hold", account: "user_held", userId: "u3", questId: "q11", amountMinor: 15000, at: "2026-09-15T22:30:00+08:00", memo: "Held for a quest" },
];

describe("stampTxn", () => {
  it("stamps a balanced set of drafts with a shared txnId and sequential ids", () => {
    const entries = stampTxn("tx-1", "2026-09-16T09:00:00+08:00", [
      { account: "user_available", userId: "u0", questId: null, amountMinor: -100, memo: "a" },
      { account: "external_bank", userId: "u0", questId: null, amountMinor: 100, memo: "a" },
    ]);
    expect(entries.map((e) => e.id)).toEqual(["tx-1-1", "tx-1-2"]);
    expect(entries.every((e) => e.txnId === "tx-1" && e.at === "2026-09-16T09:00:00+08:00")).toBe(true);
  });

  it("throws LedgerImbalanceError when drafts don't sum to zero", () => {
    expect(() =>
      stampTxn("tx-bad", "2026-09-16T09:00:00+08:00", [
        { account: "user_available", userId: "u0", questId: null, amountMinor: -100, memo: "a" },
        { account: "external_bank", userId: "u0", questId: null, amountMinor: 90, memo: "a" },
      ])
    ).toThrow(LedgerImbalanceError);
  });
});

describe("balanceOf against a fixture mirroring the real seed", () => {
  it("matches u0's derived available/held balances", () => {
    expect(balanceOf(FIXTURE_LEDGER, "user_available", "u0")).toBe(535500);
    expect(balanceOf(FIXTURE_LEDGER, "user_held", "u0")).toBe(30000);
  });

  it("matches u1's and u3's open holds (q1, q11)", () => {
    expect(balanceOf(FIXTURE_LEDGER, "user_held", "u1")).toBe(40000);
    expect(balanceOf(FIXTURE_LEDGER, "user_held", "u3")).toBe(15000);
  });

  it("platform_fee is keyed on userId null and only q8 has paid one out so far", () => {
    expect(balanceOf(FIXTURE_LEDGER, "platform_fee", null)).toBe(3500);
  });
});

describe("heldForQuest", () => {
  it("reads the poster's own held amount for one quest", () => {
    expect(heldForQuest(FIXTURE_LEDGER, "u1", "q1")).toBe(40000);
    expect(heldForQuest(FIXTURE_LEDGER, "u0", "q7")).toBe(30000);
  });

  it("is 0 for a quest never held", () => {
    expect(heldForQuest(FIXTURE_LEDGER, "u0", "q6")).toBe(0);
  });
});

describe("spendableOf", () => {
  const ledger: LedgerEntry[] = [
    { id: "e1", txnId: "tx-open", account: "user_available", userId: "u0", questId: null, amountMinor: 100000, at: "t", memo: "m" },
  ];

  it("equals available when nothing is pending", () => {
    expect(spendableOf(ledger, [], "u0")).toBe(100000);
  });

  it("subtracts only pending cash-outs, ignoring deposits and settled/failed payments", () => {
    const payments: Payment[] = [
      { id: "p1", txnId: "tx-cash-1", kind: "cashout", userId: "u0", amountMinor: 30000, state: "pending", provider: "simulated", providerId: "s1", createdAt: "t", settledAt: null },
      { id: "p2", txnId: "tx-cash-2", kind: "cashout", userId: "u0", amountMinor: 10000, state: "succeeded", provider: "simulated", providerId: "s2", createdAt: "t", settledAt: "t" },
      { id: "p3", txnId: "tx-top-1", kind: "deposit", userId: "u0", amountMinor: 50000, state: "pending", provider: "simulated", providerId: "s3", createdAt: "t", settledAt: null },
    ];
    expect(spendableOf(ledger, payments, "u0")).toBe(70000);
  });
});

describe("entry builders sum to zero and match the seed's own examples", () => {
  it("holdEntries: available down, held up by the same amount", () => {
    const drafts = holdEntries("u0", "q6", 25000);
    expect(drafts.reduce((s, d) => s + d.amountMinor, 0)).toBe(0);
    expect(drafts).toEqual([
      { account: "user_available", userId: "u0", questId: "q6", amountMinor: -25000, memo: "Held for a quest" },
      { account: "user_held", userId: "u0", questId: "q6", amountMinor: 25000, memo: "Held for a quest" },
    ]);
  });

  it("releaseEntries matches q8's real fixture split exactly (gross 35000 -> net 31500, fee 3500)", () => {
    const { drafts, fee, net } = releaseEntries("u2", "u0", "q8", 35000);
    expect(fee).toBe(3500);
    expect(net).toBe(31500);
    expect(drafts.reduce((s, d) => s + d.amountMinor, 0)).toBe(0);
    expect(drafts).toEqual([
      { account: "user_held", userId: "u2", questId: "q8", amountMinor: -35000, memo: "Released to the doer" },
      { account: "user_available", userId: "u0", questId: "q8", amountMinor: 31500, memo: "Quest paid" },
      { account: "platform_fee", userId: null, questId: "q8", amountMinor: 3500, memo: "Platform fee" },
    ]);
  });

  it("refundEntries is a full refund, no fee", () => {
    const drafts = refundEntries("u1", "q1", 40000);
    expect(drafts.reduce((s, d) => s + d.amountMinor, 0)).toBe(0);
    expect(drafts).toEqual([
      { account: "user_held", userId: "u1", questId: "q1", amountMinor: -40000, memo: "Refunded after cancellation" },
      { account: "user_available", userId: "u1", questId: "q1", amountMinor: 40000, memo: "Refunded after cancellation" },
    ]);
  });

  it("depositEntries: external_bank down, user_available up, memo names the bank", () => {
    const drafts = depositEntries("u0", 50000, "CTBC •••• 4417");
    expect(drafts.reduce((s, d) => s + d.amountMinor, 0)).toBe(0);
    expect(drafts[0].memo).toBe("Added from CTBC •••• 4417");
  });

  it("cashOutEntries: user_available down, external_bank up, memo names the bank", () => {
    const drafts = cashOutEntries("u0", 50000, "CTBC •••• 4417");
    expect(drafts.reduce((s, d) => s + d.amountMinor, 0)).toBe(0);
    expect(drafts[1].memo).toBe("Cash out to CTBC •••• 4417");
  });
});

describe("walletRowsFor + classifyWalletRow against a fixture mirroring the real seed", () => {
  const rows = walletRowsFor(FIXTURE_LEDGER, "u0");

  it("groups u0's entries into one row per transaction, newest first", () => {
    expect(rows[0].txnId).toBe("tx-q7-hold");
    expect(rows.every((r, i) => i === 0 || Date.parse(rows[i - 1].at) >= Date.parse(r.at))).toBe(true);
  });

  it("classifies tx-cash-1 as sent (money leaving to the bank)", () => {
    const row = rows.find((r) => r.txnId === "tx-cash-1")!;
    expect(classifyWalletRow(row)).toEqual({ kind: "sent", amountMinor: -150000, signed: true });
  });

  it("classifies the opening balance as added", () => {
    const row = rows.find((r) => r.txnId === "tx-open")!;
    expect(classifyWalletRow(row)).toEqual({ kind: "added", amountMinor: 684000, signed: true });
  });

  it("classifies q7's hold (still open, u0 is poster) as held", () => {
    const row = rows.find((r) => r.txnId === "tx-q7-hold")!;
    expect(classifyWalletRow(row)).toEqual({ kind: "held", amountMinor: -30000, signed: true });
  });

  it("classifies q8's release as paid_in for u0 (the doer receiving the net amount)", () => {
    const row = rows.find((r) => r.txnId === "tx-q8-release")!;
    expect(classifyWalletRow(row)).toEqual({ kind: "paid_in", amountMinor: 31500, signed: true });
  });

  it("classifies a poster-side release as released, unsigned", () => {
    // Synthesize a poster's own view of a release: held goes down, available stays 0.
    const posterRelease = walletRowsFor(
      [
        { id: "1", txnId: "tx-release-x", account: "user_held", userId: "u9", questId: "q-x", amountMinor: -20000, at: "t", memo: "Released to the doer" },
      ],
      "u9"
    )[0];
    expect(classifyWalletRow(posterRelease)).toEqual({ kind: "released", amountMinor: 20000, signed: false });
  });

  it("classifies a refund as refunded (held down, available up, same user)", () => {
    const refundRow = walletRowsFor(
      [
        { id: "1", txnId: "tx-refund-x", account: "user_held", userId: "u9", questId: "q-x", amountMinor: -20000, at: "t", memo: "Refunded after cancellation" },
        { id: "2", txnId: "tx-refund-x", account: "user_available", userId: "u9", questId: "q-x", amountMinor: 20000, at: "t", memo: "Refunded after cancellation" },
      ],
      "u9"
    )[0];
    expect(classifyWalletRow(refundRow)).toEqual({ kind: "refunded", amountMinor: 20000, signed: true });
  });
});
