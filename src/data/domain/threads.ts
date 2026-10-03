/* Chat selectors, ported from preview/app.js:477-499 — a sibling to
   lifecycle.ts rather than an addition to it, since lifecycle.ts's own
   header comment scopes itself to PRD §8's quest state machine
   specifically, and these are thread/message-shaped instead. Pure and
   framework-free, same reasoning as lifecycle.ts's own selectors. */
import type { Thread, Message } from "../contracts";

/** The one thread for a given (quest, doer) pair (PRD §7.5), or null if
    that doer has never made an offer on the quest. */
export function threadFor(threads: Thread[], questId: string, doerId: string): Thread | null {
  return threads.find((t) => t.questId === questId && t.doerId === doerId) ?? null;
}

/** Every thread a user is a side of, newest activity first. */
export function threadsFor(threads: Thread[], userId: string): Thread[] {
  return threads
    .filter((t) => t.posterId === userId || t.doerId === userId)
    .sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt));
}

/** The other participant's id, id-only per this module's own style —
    resolving it to a real User is the caller's job. */
export function otherSideOf(thread: Thread, userId: string): string {
  return thread.posterId === userId ? thread.doerId : thread.posterId;
}

/** Messages from the other side sent after the reader's own last-read
    timestamp — a message someone sent to themselves never counts, and a
    thread the reader has never opened counts everything. */
export function unreadIn(messages: Message[], userId: string, readAtIso: string | null): number {
  const readAtMs = readAtIso ? Date.parse(readAtIso) : -Infinity;
  return messages.filter((m) => m.senderId !== userId && Date.parse(m.at) > readAtMs).length;
}
