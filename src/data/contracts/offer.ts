import { z } from "zod";

export const OfferStatusSchema = z.enum(["pending", "accepted", "declined", "withdrawn", "expired"]);
export type OfferStatus = z.infer<typeof OfferStatusSchema>;

export const OfferSchema = z.object({
  id: z.string(),
  questId: z.string(),
  doerId: z.string(),
  amountMinor: z.number().int().positive(),
  status: OfferStatusSchema,
  note: z.string(),
  createdAt: z.string(),
  respondedAt: z.string().nullable(),
});

export type Offer = z.infer<typeof OfferSchema>;
