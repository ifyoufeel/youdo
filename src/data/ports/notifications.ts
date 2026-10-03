import type { Notification } from "../contracts";
import type { Idempotent, Subscription } from "./common";

export interface NotificationsPort {
  listForUser(userId: string): Promise<Notification[]>;
  markAllRead(userId: string, idempotency: Idempotent): Promise<void>;
  subscribeToUser(userId: string, onNotification: (n: Notification) => void): Subscription;
}
