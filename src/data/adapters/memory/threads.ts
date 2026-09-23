import type { ThreadsPort } from "../../ports/threads";
import { NotImplementedYet } from "./not-implemented";

/* Messaging lands in M4 alongside the lifecycle mutations it's coupled to
   (an offer being accepted is what creates a thread) — stubbed until then. */
export function createMemoryThreadsPort(): ThreadsPort {
  return {
    async listThreadsForUser() {
      throw new NotImplementedYet("listThreadsForUser", "M4");
    },
    async getThread() {
      throw new NotImplementedYet("getThread", "M4");
    },
    async listMessages() {
      throw new NotImplementedYet("listMessages", "M4");
    },
    async sendMessage() {
      throw new NotImplementedYet("sendMessage", "M4");
    },
    async markThreadRead() {
      throw new NotImplementedYet("markThreadRead", "M4");
    },
    subscribeToThread() {
      return { unsubscribe() {} };
    },
  };
}
