import { z } from "zod";

/* ADR-005: append-only, double-entry-lite across five named accounts.
   Balances are derived by summation, never stored — this schema has no
   "balance" field anywhere, deliberately. */
export const LedgerAccountSchema = z.enum([
  "user_available",
  "user_held",
  "platform_escrow",
  "platform_fee",
  "external_bank",
]);
export type LedgerAccount = z.infer<typeof LedgerAccountSchema>;

export const LedgerEntrySchema = z.object({
  id: z.string(),
  txnId: z.string(),
  account: LedgerAccountSchema,
  userId: z.string().nullable(), // null for platform_fee / platform_escrow entries
  questId: z.string().nullable(),
  amountMinor: z.number().int(), // signed — this is the one place a bare signed integer, not Money, is correct: Money's branding is about display-boundary safety, not ledger arithmetic
  at: z.string(),
  memo: z.string(),
});

export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;
