import { z } from "zod";
import { PointSchema } from "./geo";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number().min(0).max(5),
  questsCompleted: z.number().int().nonnegative(),
  verified: z.boolean(),
  area: z.string(),
  home: PointSchema,
  cancelRate: z.number().min(0).max(1),
  bio: z.string(),
  phone: z.string(), // +886 format per PRD §5
  email: z.string(),
  bank: z.string(),
  joined: z.string(), // ISO instant
  /** A public URL (a local device URI from the memory adapter, a
      Supabase Storage public URL for real), or null — most seeded users
      have none. PRD §4 calls a profile photo a requirement to post or
      offer; that gate is deliberately not enforced (ADR-018), so this
      stays nullable rather than becoming a non-null field the whole
      fixture would need backfilling to satisfy. */
  avatarUrl: z.string().nullable(),
});

export type User = z.infer<typeof UserSchema>;
