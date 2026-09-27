/* Real as of M4 — sendMessage needs its own idempotency-key result cache
   (postQuest's postedByKey is the template: no natural post-hoc lookup a
   replay could fall back on, since a sender could legitimately send two
   identical-looking messages in one session). Everything else here reads
   or writes the Maps store.ts parses from seed.messagesByThread/
   seed.threadReadAt. */
import type { ThreadsPort } from "../../ports/threads";
import type { Message } from "../../contracts";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { isFirstUse } from "./idempotency";
import { threads, messages, threadReadAt, quests } from "./store";
import { threadsFor, unreadIn } from "../../domain/threads";
import { isClosed } from "../../domain/lifecycle";
import { nextId } from "./next-id";
import { notify } from "./notify";

const sentByKey = new Map<string, Message>();

export function createMemoryThreadsPort(): ThreadsPort {
  return {
    async listThreadsForUser(userId) {
      await simulateLatency();
      maybeInjectFault("listThreadsForUser");
      return threadsFor(threads, userId);
    },

    async getThread(id) {
      await simulateLatency();
      maybeInjectFault("getThread");
      return threads.find((t) => t.id === id) ?? null;
    },

    async listMessages(threadId) {
      await simulateLatency();
      maybeInjectFault("listMessages");
      return messages.get(threadId) ?? [];
    },

    async unreadCountForThread(threadId, userId) {
      await simulateLatency();
      maybeInjectFault("unreadCountForThread");
      const readAt = threadReadAt.get(`${userId}:${threadId}`) ?? null;
      return unreadIn(messages.get(threadId) ?? [], userId, readAt);
    },

    async sendMessage(threadId, senderId, body, idempotency) {
      await simulateLatency();
      maybeInjectFault("sendMessage");

      const thread = threads.find((t) => t.id === threadId);
      if (!thread) {
        throw new Error("sendMessage: no such thread");
      }
      const quest = quests.find((q) => q.id === thread.questId);
      if (quest && isClosed(quest.status)) {
        throw new Error("This quest is closed, so the thread is read-only");
      }
      if (!body.trim()) {
        throw new Error("Say something first");
      }

      if (!isFirstUse("sendMessage", idempotency.idempotencyKey)) {
        const cached = sentByKey.get(idempotency.idempotencyKey);
        if (cached) return cached;
      }

      const message: Message = { id: nextId("m"), senderId, body, at: new Date().toISOString() };
      const list = messages.get(threadId);
      if (list) {
        list.push(message);
      } else {
        messages.set(threadId, [message]);
      }
      thread.lastMessageAt = message.at;
      sentByKey.set(idempotency.idempotencyKey, message);

      const otherId = thread.posterId === senderId ? thread.doerId : thread.posterId;
      notify(otherId, "message", thread.questId, body);

      return message;
    },

    async markThreadRead(threadId, userId) {
      await simulateLatency();
      maybeInjectFault("markThreadRead");
      // Naturally idempotent (last-write-wins on a timestamp) — no
      // idempotency-key tracking needed, same reasoning saveQuest's
      // Set.add gives for skipping one.
      threadReadAt.set(`${userId}:${threadId}`, new Date().toISOString());
    },

    subscribeToThread() {
      return { unsubscribe() {} };
    },
  };
}
