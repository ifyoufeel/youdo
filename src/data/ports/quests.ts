import type { Quest, Point } from "../contracts";
import type { Page, PageParams, Idempotent, Subscription } from "./common";

/** What a poster actually supplies (PRD §7.4's wizard); id, status,
    createdAt, acceptedOfferId and every lifecycle timestamp are
    server-assigned, never client input. */
export interface PostQuestInput {
  posterId: string;
  title: string;
  details: string;
  categoryId: string;
  payoutMinor: number;
  estimatedMinutes: number;
  addressLine: string;
  area: string;
  point: Point;
  scheduledFor: string;
  expiresAt: string;
  requirements: string[];
}

export interface ListQuestsParams extends PageParams {
  /** ADR-004's "geo params in listQuests({center, radiusM, cursor})",
      honored from M0 even though the memory adapter filters an in-memory
      array rather than running a PostGIS query (that's M7). */
  center: Point;
  radiusM: number;
  categoryId?: string;
  minPayMinor?: number;
  verifiedPostersOnly?: boolean;
  search?: string;
}

export interface QuestsPort {
  listQuests(params: ListQuestsParams): Promise<Page<Quest>>;
  getQuest(id: string): Promise<Quest | null>;
  postQuest(input: PostQuestInput, idempotency: Idempotent): Promise<Quest>;

  /* PRD §8 lifecycle mutations. Each is guarded server-side against
     src/data/domain/lifecycle.ts's TRANSITIONS table — an actor without
     the right role gets a rejection, not a silently-ignored request. */
  startQuest(questId: string, actorId: string, idempotency: Idempotent): Promise<Quest>;
  markDone(questId: string, actorId: string, idempotency: Idempotent): Promise<Quest>;
  /** completed -> paid. Releases escrow (LedgerPort's concern, triggered
      as a side effect here, never called directly — see LedgerPort's own
      module comment for why). */
  confirmDone(questId: string, actorId: string, idempotency: Idempotent): Promise<Quest>;
  cancelQuest(questId: string, actorId: string, reason: string, idempotency: Idempotent): Promise<Quest>;
  disputeQuest(questId: string, actorId: string, reason: string, idempotency: Idempotent): Promise<Quest>;

  /* PRD §7.2's saved list — small per-user, no pagination needed. */
  listSavedQuestIds(userId: string): Promise<string[]>;
  saveQuest(userId: string, questId: string, idempotency: Idempotent): Promise<void>;
  unsaveQuest(userId: string, questId: string, idempotency: Idempotent): Promise<void>;

  /** Real payloads only once Supabase's realtime is wired (M7); the
      memory adapter's implementation is a typed no-op. */
  subscribeToQuest(questId: string, onChange: (quest: Quest) => void): Subscription;
}
