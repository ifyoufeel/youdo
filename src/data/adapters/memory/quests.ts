import type { QuestsPort } from "../../ports/quests";
import { distanceBetween } from "../../contracts";
import { paginate } from "./pagination";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { quests } from "./store";
import { NotImplementedYet } from "./not-implemented";

export function createMemoryQuestsPort(): QuestsPort {
  return {
    async listQuests(params) {
      await simulateLatency();
      maybeInjectFault("listQuests");
      const filtered = quests.filter((q) => {
        if (distanceBetween(q.point, params.center) > params.radiusM) return false;
        if (params.categoryId && q.categoryId !== params.categoryId) return false;
        if (params.minPayMinor !== undefined && q.payoutMinor < params.minPayMinor) return false;
        if (params.search) {
          const needle = params.search.toLowerCase();
          if (!q.title.toLowerCase().includes(needle) && !q.details.toLowerCase().includes(needle)) {
            return false;
          }
        }
        // verifiedPostersOnly needs a join against users — left for M1/M2,
        // once a real screen actually surfaces this filter.
        return true;
      });
      return paginate(filtered, params);
    },

    async getQuest(id) {
      await simulateLatency();
      maybeInjectFault("getQuest");
      return quests.find((q) => q.id === id) ?? null;
    },

    async postQuest() {
      throw new NotImplementedYet("postQuest", "M2");
    },
    async startQuest() {
      throw new NotImplementedYet("startQuest", "M4");
    },
    async markDone() {
      throw new NotImplementedYet("markDone", "M4");
    },
    async confirmDone() {
      throw new NotImplementedYet("confirmDone", "M5");
    },
    async cancelQuest() {
      throw new NotImplementedYet("cancelQuest", "M4");
    },
    async disputeQuest() {
      throw new NotImplementedYet("disputeQuest", "M6");
    },
    async listSavedQuestIds() {
      throw new NotImplementedYet("listSavedQuestIds", "M2");
    },
    async saveQuest() {
      throw new NotImplementedYet("saveQuest", "M2");
    },
    async unsaveQuest() {
      throw new NotImplementedYet("unsaveQuest", "M2");
    },

    /** A real payload only once Supabase's realtime is wired (M7) — until
        then every port's subscribe is a typed no-op, per ADR-004. */
    subscribeToQuest() {
      return { unsubscribe() {} };
    },
  };
}
