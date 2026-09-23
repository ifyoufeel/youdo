/* PRD §8's state machine. `draft` is real (a quest saved locally, not yet
   discoverable) but never appears in the fixture — nothing local-only has
   a server record to seed. */
import { z } from "zod";
import { PointSchema } from "./geo";

export const QuestStatusSchema = z.enum([
  "draft",
  "open",
  "assigned",
  "in_progress",
  "completed",
  "paid",
  "cancelled",
  "expired",
  "disputed",
]);
export type QuestStatus = z.infer<typeof QuestStatusSchema>;

/** ADR-011: one price per quest. `fixed` is the only value written today;
    the field survives so a second mode could be reintroduced without a
    migration, per that ADR's own "Consequences" note. */
export const PayoutUnitSchema = z.literal("fixed");

export const QuestSchema = z.object({
  id: z.string(),
  posterId: z.string(),
  title: z.string(),
  payoutMinor: z.number().int().positive(),
  payoutUnit: PayoutUnitSchema,
  categoryId: z.string(),
  point: PointSchema,
  estimatedMinutes: z.number().int().positive(),
  scheduledFor: z.string(), // ISO instant
  expiresAt: z.string(), // ISO instant
  createdAt: z.string(), // ISO instant
  status: QuestStatusSchema,
  acceptedOfferId: z.string().nullable(),
  addressLine: z.string(), // PRD §4.3 — never sent to a client until addressVisibleTo() says so; the port layer's job, not this schema's
  area: z.string(),
  details: z.string(),
  requirements: z.array(z.string()),

  // Lifecycle timestamps — present only once the quest has reached the
  // state that sets them (PRD §8's transition table, ported verbatim in
  // src/data/domain/lifecycle.ts).
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  paidAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  cancelledBy: z.string().optional(),
  cancelReason: z.string().optional(),
  disputeReason: z.string().optional(),
});

export type Quest = z.infer<typeof QuestSchema>;
