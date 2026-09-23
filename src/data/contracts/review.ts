import { z } from "zod";

/* PRD §7.8: unlocked only after `paid`, visible after both sides submit or
   14 days pass — that reveal rule is a query-time concern for ReviewsPort,
   not something this schema encodes (the record itself is always real;
   visibility is who's allowed to see it, computed at read time). */
export const ReviewSchema = z.object({
  id: z.string(),
  questId: z.string(),
  raterId: z.string(),
  rateeId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  at: z.string(),
});

export type Review = z.infer<typeof ReviewSchema>;
