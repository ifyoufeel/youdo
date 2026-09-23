/* The memory adapter's live, mutable state. Built once at module load by
   parsing `seed` through the real zod schemas (not just trusting the
   `as const` literal) — catches any future drift between seed.ts and the
   contracts at runtime, in every environment that imports this module,
   not only under `fixture.test.ts`. Held as Maps so the (currently few)
   real methods do O(1) lookups; arrays are re-derived with Array.from
   where an ordered list is what the port actually returns. */
import {
  UserSchema,
  QuestSchema,
  type User,
  type Quest,
  type Category,
  CategorySchema,
} from "../../contracts";
import { seed } from "./seed";

function parseRecord<T>(schema: { parse: (v: unknown) => T }, record: Record<string, unknown>): Map<string, T> {
  const map = new Map<string, T>();
  for (const [id, value] of Object.entries(record)) {
    map.set(id, schema.parse(value));
  }
  return map;
}

function parseArray<T>(schema: { parse: (v: unknown) => T }, arr: readonly unknown[]): T[] {
  return arr.map((v) => schema.parse(v));
}

export const users: Map<string, User> = parseRecord(UserSchema, seed.users);
export const quests: Quest[] = parseArray(QuestSchema, seed.quests);
export const categories: Category[] = parseArray(CategorySchema, seed.categories);

export const meId: string = seed.meId;
