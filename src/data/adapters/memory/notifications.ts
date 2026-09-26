import type { NotificationsPort } from "../../ports/notifications";
import { NotImplementedYet } from "./not-implemented";

/* Notifications are emitted as side effects of the mutations above
   (offer/lifecycle/message events) — nothing produces one yet, so
   there's nothing real for this port to read. Stubbed until those
   milestones land. */
export function createMemoryNotificationsPort(): NotificationsPort {
  return {
    async listForUser() {
      throw new NotImplementedYet("listForUser", "M4");
    },
    async markAllRead() {
      throw new NotImplementedYet("markAllRead", "M4");
    },
    subscribeToUser() {
      return { unsubscribe() {} };
    },
  };
}
