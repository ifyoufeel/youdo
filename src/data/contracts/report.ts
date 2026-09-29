import { z } from "zod";

/* PRD §7.8: "Report and block on any user or quest." The prototype's own
   report button (preview/app.js:3748-3761) never actually stores
   anything — it's a toast over an empty state. This schema makes it
   real: a genuine record, even though — like disputeQuest's resolution
   half — nothing in the product reads it back. No admin queue exists to
   review reports; a frozen, unreachable-by-UI record is an accepted
   shape here already, same precedent as a disputed quest. */
export const ReportSchema = z.object({
  id: z.string(),
  reporterId: z.string(),
  targetUserId: z.string(),
  reason: z.string(),
  at: z.string(),
});

export type Report = z.infer<typeof ReportSchema>;
