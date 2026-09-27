/* Real as of M4 — reads the notifications array offers.ts/quests.ts/
   threads.ts push into via the shared notify() helper (./notify.ts). */
import type { NotificationsPort } from "../../ports/notifications";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { isFirstUse } from "./idempotency";
import { notifications } from "./store";

export function createMemoryNotificationsPort(): NotificationsPort {
  return {
    async listForUser(userId) {
      await simulateLatency();
      maybeInjectFault("listForUser");
      return notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
    },

    async markAllRead(userId, idempotency) {
      await simulateLatency();
      maybeInjectFault("markAllRead");
      if (!isFirstUse("markAllRead", idempotency.idempotencyKey)) return;
      const now = new Date().toISOString();
      for (const n of notifications) {
        if (n.userId === userId && !n.readAt) n.readAt = now;
      }
    },

    subscribeToUser() {
      return { unsubscribe() {} };
    },
  };
}
