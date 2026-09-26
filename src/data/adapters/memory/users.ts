import type { UsersPort } from "../../ports/users";
import { paginate } from "./pagination";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { users } from "./store";

export function createMemoryUsersPort(): UsersPort {
  return {
    async getUser(id) {
      await simulateLatency();
      maybeInjectFault("getUser");
      return users.get(id) ?? null;
    },

    async listUsers(params) {
      await simulateLatency();
      maybeInjectFault("listUsers");
      return paginate(Array.from(users.values()), params);
    },

    async updateProfile(userId, patch) {
      await simulateLatency();
      maybeInjectFault("updateProfile");
      const existing = users.get(userId);
      if (!existing) {
        throw new Error(`updateProfile: no user ${userId}`);
      }
      const updated = { ...existing, ...patch };
      users.set(userId, updated);
      return updated;
    },
  };
}
