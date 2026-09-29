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
  type Message,
  MessageSchema,
  type Notification,
  NotificationSchema,
  type LedgerEntry,
  LedgerEntrySchema,
  type Payment,
  type Review,
  ReviewSchema,
  type Report,
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

/** Mutable — sendOffer/withdrawOffer (M2) and acceptOffer/declineOffer
    (M4) all push and rewrite entries here directly, same pattern as
    savedQuestIds above. */
export const offers: Offer[] = parseArray(OfferSchema, seed.offers);

/** Mutable — sendOffer (M2) creates one of these, find-or-create by
    (questId, doerId), the moment a doer's first offer on a quest lands. */
export const threads: Thread[] = parseArray(ThreadSchema, seed.threads);

/** Mutable — sendMessage (M4) pushes onto the array for its thread's key
    (creating one on first send if this thread has no seeded messages).
    Keyed by thread id, matching seed.messagesByThread's own shape — a Map
    rather than a Thread field, since a client never gets the whole
    message list without asking for it explicitly (listMessages). */
export const messages: Map<string, Message[]> = new Map(
  Object.entries(seed.messagesByThread).map(([threadId, msgs]) => [threadId, parseArray(MessageSchema, msgs)])
);

/** Mutable — markThreadRead (M4) writes through this directly, flat
    `"${userId}:${threadId}"` keys exactly matching seed.threadReadAt's own
    shape (no reshaping needed) since a per-(user, thread) read timestamp
    has no other natural home among this file's other Maps. */
export const threadReadAt: Map<string, string> = new Map(Object.entries(seed.threadReadAt));

/** Mutable — offers/quests/threads mutations (M4) push into this via the
    shared notify() helper (./notify.ts) the moment an event worth telling
    a user about happens. Seeded from the fixture's own notifications so
    the preview gallery has real unread rows to show from cold start. */
export const notifications: Notification[] = parseArray(NotificationSchema, seed.notifications);

/** Mutable — post-txn.ts (M5) is the only writer, appending the entries
    escrow hold/release/refund and deposit/cash-out settlement create.
    Seeded from the fixture's own real ledger history (opening balances,
    q8's full hold+release+fee cycle, the still-open q1/q7/q11 holds). */
export const ledger: LedgerEntry[] = parseArray(LedgerEntrySchema, seed.ledger);

/** Mutable — ledger.ts's deposit/cashOut (M5) push a `pending` row here
    immediately, then settle it in place once payment-settlement.ts's
    jittered timer fires. No seed data: the fixture's historical
    transactions (tx-open, tx-cash-1, ...) predate the payments table —
    modeling them as payments that "already settled" would invent a
    provider reference nothing backs. */
export const payments: Payment[] = [];

/** Mutable — reviews.ts's submitReview (M6) pushes here. Seeded from the
    fixture's one deliberately-half-rated pair (q8: u2 has rated u0, u0
    hasn't rated back yet) so both sides of PRD §7.8's reveal rule — shown
    once both submit, or after 14 days — are demonstrable from cold
    start. */
export const reviews: Review[] = parseArray(ReviewSchema, seed.reviews);

/** Mutable — trust.ts's reportUser (M6) pushes here. No seed data: nobody
    in the fixture has reported anyone. No admin queue reads this back —
    a frozen, unreachable-by-UI record, same accepted shape as a disputed
    quest's own resolution half. */
export const reports: Report[] = [];

/** Mutable — trust.ts's blockUser (M6) writes through this directly,
    same Map<userId, Set<id>> shape as savedQuestIds above. No seed data:
    nobody in the fixture has blocked anyone. */
export const blockedUserIds: Map<string, Set<string>> = new Map();
