import type { Thread, Message } from "../contracts";
import type { Idempotent, Subscription } from "./common";

export interface ThreadsPort {
  /** Per-user, bounded (PRD §7.5: one thread per quest×doer pair) — no
      pagination the way a global feed would need it. */
  listThreadsForUser(userId: string): Promise<Thread[]>;
  getThread(id: string): Promise<Thread | null>;
  listMessages(threadId: string): Promise<Message[]>;

  /** Read-only once the quest closes (PRD §7.5) — the adapter refuses a
      send on a closed thread's quest, same as QuestsPort refuses an
      illegal lifecycle transition. */
  sendMessage(threadId: string, senderId: string, body: string, idempotency: Idempotent): Promise<Message>;
  markThreadRead(threadId: string, userId: string): Promise<void>;

  subscribeToThread(threadId: string, onMessage: (message: Message) => void): Subscription;
}
