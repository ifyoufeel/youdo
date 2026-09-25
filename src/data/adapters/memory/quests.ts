import type { QuestsPort, QuestSort } from "../../ports/quests";
import type { Point, Quest } from "../../contracts";
import { distanceBetween } from "../../contracts";
import { paginate } from "./pagination";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { quests, users, savedQuestIds } from "./store";
import { isFirstUse } from "./idempotency";
import { NotImplementedYet } from "./not-implemented";

/** Same calendar date (local time) as the adapter's notion of "now" — the
    real device clock, since nothing wires the preview's simulated clock
    into the data layer (that's dev-only chrome, a separate concern). */
function isToday(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function sortQuests(list: Quest[], sort: QuestSort | undefined, center: Point): Quest[] {
  const withDistance = list.map((q) => ({ q, distance: distanceBetween(q.point, center) }));
  switch (sort) {
    case "pay":
      withDistance.sort((a, b) => b.q.payoutMinor - a.q.payoutMinor);
      break;
    case "ending":
      withDistance.sort((a, b) => Date.parse(a.q.expiresAt) - Date.parse(b.q.expiresAt));
      break;
    case "newest":
      withDistance.sort((a, b) => Date.parse(b.q.createdAt) - Date.parse(a.q.createdAt));
      break;
    case "closest":
    default:
      withDistance.sort((a, b) => a.distance - b.distance);
      break;
  }
  return withDistance.map((x) => x.q);
}

export function createMemoryQuestsPort(): QuestsPort {
  return {
    async listQuests(params) {
      await simulateLatency();
      maybeInjectFault("listQuests");
      const now = new Date();
      const filtered = quests.filter((q) => {
        // The browse feed is the open marketplace, not a per-user activity
        // list — matches preview/app.js's BrowseScreen, which filters to
        // status "open" before applying any of the params below. A quest
        // once assigned/completed/paid/cancelled/expired/disputed belongs
        // on "My quests" (M3+), never back in this feed.
        if (q.status !== "open") return false;
        if (distanceBetween(q.point, params.center) > params.radiusM) return false;
        if (params.categoryId && q.categoryId !== params.categoryId) return false;
        if (params.minPayMinor !== undefined && q.payoutMinor < params.minPayMinor) return false;
        if (params.verifiedPostersOnly && !users.get(q.posterId)?.verified) return false;
        if (params.todayOnly && !isToday(q.scheduledFor, now)) return false;
        if (params.search) {
          const needle = params.search.toLowerCase();
          if (!q.title.toLowerCase().includes(needle) && !q.details.toLowerCase().includes(needle)) {
            return false;
          }
        }
        return true;
      });
      const sorted = sortQuests(filtered, params.sort, params.center);
      return paginate(sorted, params);
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

    async listSavedQuestIds(userId) {
      await simulateLatency();
      maybeInjectFault("listSavedQuestIds");
      return Array.from(savedQuestIds.get(userId) ?? []);
    },
    async saveQuest(userId, questId, idempotency) {
      await simulateLatency();
      maybeInjectFault("saveQuest");
      if (!isFirstUse("saveQuest", idempotency.idempotencyKey)) return;
      let set = savedQuestIds.get(userId);
      if (!set) {
        set = new Set();
        savedQuestIds.set(userId, set);
      }
      set.add(questId);
    },
    async unsaveQuest(userId, questId, idempotency) {
      await simulateLatency();
      maybeInjectFault("unsaveQuest");
      if (!isFirstUse("unsaveQuest", idempotency.idempotencyKey)) return;
      savedQuestIds.get(userId)?.delete(questId);
    },

    /** A real payload only once Supabase's realtime is wired (M7) — until
        then every port's subscribe is a typed no-op, per ADR-004. */
    subscribeToQuest() {
      return { unsubscribe() {} };
    },
  };
}
