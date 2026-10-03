import { PaymentSchema } from "../payment";

const VALID = {
  id: "pay1",
  txnId: "tx-topup-1",
  kind: "deposit" as const,
  userId: "u0",
  amountMinor: 50000,
  state: "pending" as const,
  provider: "simulated" as const,
  providerId: "sim-1",
  createdAt: "2026-09-16T09:00:00+08:00",
  settledAt: null,
};

describe("PaymentSchema", () => {
  it("accepts a valid pending payment", () => {
    expect(() => PaymentSchema.parse(VALID)).not.toThrow();
  });

  it("accepts a settled payment with settledAt set", () => {
    expect(() => PaymentSchema.parse({ ...VALID, state: "succeeded", settledAt: "2026-09-16T09:00:05+08:00" })).not.toThrow();
  });

  it("accepts both kinds", () => {
    expect(() => PaymentSchema.parse({ ...VALID, kind: "cashout" })).not.toThrow();
  });

  it("rejects a zero or negative amount", () => {
    expect(() => PaymentSchema.parse({ ...VALID, amountMinor: 0 })).toThrow();
    expect(() => PaymentSchema.parse({ ...VALID, amountMinor: -100 })).toThrow();
  });

  it("rejects a non-integer amount", () => {
    expect(() => PaymentSchema.parse({ ...VALID, amountMinor: 100.5 })).toThrow();
  });

  it("rejects an unknown kind or state", () => {
    expect(() => PaymentSchema.parse({ ...VALID, kind: "withdrawal" })).toThrow();
    expect(() => PaymentSchema.parse({ ...VALID, state: "processing" })).toThrow();
  });

  it("rejects a provider other than the literal 'simulated'", () => {
    expect(() => PaymentSchema.parse({ ...VALID, provider: "stripe" })).toThrow();
  });
});
