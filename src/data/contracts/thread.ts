import { z } from "zod";

/* One thread per (quest, doer) pair (PRD §7.5) — never shared or global.
   The prototype's original bug was a single shared thread; the fixture
   already models per-pair threads correctly. */
export const ThreadSchema = z.object({
  id: z.string(),
  questId: z.string(),
  posterId: z.string(),
  doerId: z.string(),
  lastMessageAt: z.string(),
});

export type Thread = z.infer<typeof ThreadSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  body: z.string(),
  at: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;
