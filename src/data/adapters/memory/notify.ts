/* Shared by offers.ts/quests.ts/threads.ts (M4) — every mutation that
   creates a notification-worthy event pushes through this one function
   rather than each file reimplementing the same shape, matching the
   "promote once a second consumer needs it" reach for shared plumbing
   this codebase already applies to nextId()/isFirstUse(). */
import type { NotificationType } from "../../contracts";
import { notifications } from "./store";
import { nextId } from "./next-id";

export function notify(userId: string, type: NotificationType, questId: string | null, body: string): void {
  notifications.push({
    id: nextId("n"),
    userId,
    type,
    questId,
    body,
    at: new Date().toISOString(),
    readAt: null,
  });
}
