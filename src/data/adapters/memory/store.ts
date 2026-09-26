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
  type Offer,
  OfferSchema,
  type Thread,
  ThreadSchema,
  PointSchema,
} from "../../contracts";
import type { Area } from "../../ports/areas";
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

/** Mutable — postQuest (M3) pushes new quests here directly, same pattern
    as savedQuestIds/offers/threads below. Seeded from the fixture, but
    every write after that is real. */
export const quests: Quest[] = parseArray(QuestSchema, seed.quests);

export const categories: Category[] = parseArray(CategorySchema, seed.categories);

export const areas: Area[] = Object.entries(seed.areas).map(([name, point]) => ({
  name,
  point: PointSchema.parse(point),
}));

export const meId: string = seed.meId;

/** Mutable — saveQuest/unsaveQuest write through this directly (unlike
    users/quests/categories above, which are read-only snapshots of the
    fixture). Seeded from seed.savedByUser so the starting state matches
    the fixture, but every write after that is real. */
export const savedQuestIds: Map<string, Set<string>> = new Map(
  Object.entries(seed.savedByUser).map(([userId, questIds]) => [userId, new Set(questIds)])
);

/** Mutable — sendOffer/withdrawOffer (M2) push and rewrite entries here
    directly, same pattern as savedQuestIds above. acceptOffer/
    declineOffer stay unimplemented until M4, so nothing here mutates
    `status` to "accepted"/"declined" yet. */
export const offers: Offer[] = parseArray(OfferSchema, seed.offers);

/** Mutable — sendOffer (M2) creates one of these, find-or-create by
    (questId, doerId), the moment a doer's first offer on a quest lands.
    `messagesByThread`/`threadReadAt` stay unparsed — M4's concern, once
    something actually reads or sends a message. */
export const threads: Thread[] = parseArray(ThreadSchema, seed.threads);
