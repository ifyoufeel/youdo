import { z } from "zod";

/* Every value that ever actually gets written, grepped straight out of
   preview/app.js's notifyInto() call sites and runClock's system
   transitions — not paraphrased from PRD §7.9's prose. */
export const NotificationTypeSchema = z.enum([
  "offer_received",
  "offer_accepted",
  "offer_declined",
  "quest_started",
  "quest_done",
  "quest_cancelled",
  "quest_disputed",
  "quest_expired",
  "payment",
  "message",
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeSchema,
  questId: z.string().nullable(),
  body: z.string(),
  at: z.string(),
  readAt: z.string().nullable(),
});

export type Notification = z.infer<typeof NotificationSchema>;
