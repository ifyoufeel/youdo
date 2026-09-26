import type { QuestsPort, QuestSort, PostQuestInput } from "../../ports/quests";
import type { Point, Quest } from "../../contracts";
import { distanceBetween } from "../../contracts";
import { paginate } from "./pagination";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { quests, offers, users, savedQuestIds } from "./store";
import { isFirstUse } from "./idempotency";
import { NotImplementedYet } from "./not-implemented";
import { nextId } from "./next-id";
import { offersFor, roleOn } from "../../domain/lifecycle";

/* postQuest has no natural post-hoc lookup a replay could fall back on
   (unlike sendOffer's myOfferOn, or saveQuest's idempotent-by-nature
   Set.add) — a poster could legitimately post two identical-looking
   quests in one session, so "find the quest this poster already posted"
   isn't a valid replay key. A dedicated cache keyed on the idempotency
   key itself is the only correct way to return the exact same record on
   replay rather than either a duplicate or nothing. */
const postedByKey = new Map<string, Quest>();

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

    // postQuest trusts the caller's input is already valid (app.postQuest
    // does zero validation either — the wizard's own per-step errors are
    // what actually blocks a bad submit, same division of labor as the
    // real app).
    async postQuest(input: PostQuestInput, idempotency) {
      await simulateLatency();
      maybeInjectFault("postQuest");

      if (!isFirstUse("postQuest", idempotency.idempotencyKey)) {
        const cached = postedByKey.get(idempotency.idempotencyKey);
        if (cached) return cached;
      }

      const quest: Quest = {
        id: nextId("q"),
        posterId: input.posterId,
        title: input.title,
        payoutMinor: input.payoutMinor,
        payoutUnit: "fixed",
        categoryId: input.categoryId,
        point: input.point,
        estimatedMinutes: input.estimatedMinutes,
        durationLabel: input.durationLabel,
        scheduledFor: input.scheduledFor,
        expiresAt: input.expiresAt,
        createdAt: new Date().toISOString(),
        status: "open",
        acceptedOfferId: null,
        addressLine: input.addressLine,
        area: input.area,
        details: input.details,
        requirements: input.requirements,
      };
      quests.push(quest);
      postedByKey.set(idempotency.idempotencyKey, quest);
      return quest;
    },

    async listMyQuests(userId) {
      await simulateLatency();
      maybeInjectFault("listMyQuests");
      // roleOn's own first check (quest.posterId === userId -> "poster")
      // already covers posted-by-me, so there's nothing this needs to
      // check beyond "not a visitor".
      return quests
        .filter((q) => roleOn(offersFor(offers, q.id), q, userId) !== "visitor")
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
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
