import { z } from "zod";

/* PRD §9's `payments` table — the eventual Stripe swap point (ADR-005,
   ADR-013). Only `deposit`/`cashOut` ever create one: they're the only
   transactions crossing the `external_bank` boundary. Hold/release/refund
   are purely internal `user_available`<->`user_held` moves that settle
   atomically with the lifecycle transition causing them, so they never
   pass through here — see ledger-entry.ts, which has no status field for
   the same reason a balance has no stored field. */
export const PaymentKindSchema = z.enum(["deposit", "cashout"]);
export type PaymentKind = z.infer<typeof PaymentKindSchema>;

export const PaymentStateSchema = z.enum(["pending", "succeeded", "failed"]);
export type PaymentState = z.infer<typeof PaymentStateSchema>;

export const PaymentSchema = z.object({
  id: z.string(),
  txnId: z.string(),
  kind: PaymentKindSchema,
  userId: z.string(),
  amountMinor: z.number().int().positive(),
  state: PaymentStateSchema,
  provider: z.literal("simulated"),
  providerId: z.string(),
  createdAt: z.string(),
  settledAt: z.string().nullable(),
});

export type Payment = z.infer<typeof PaymentSchema>;
