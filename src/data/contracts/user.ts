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
});

export type User = z.infer<typeof UserSchema>;
