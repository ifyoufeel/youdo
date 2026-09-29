/* PRD §7.8's report/block, real for the first time (the prototype's own
   versions are decorative — see contracts/report.ts's and
   ports/trust.ts's header comments for why the scope stops at user-level,
   no admin queue, no unblock). */
import type { TrustPort } from "../../ports/trust";
import type { Report } from "../../contracts";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { isFirstUse } from "./idempotency";
import { reports, blockedUserIds } from "./store";
import { nextId } from "./next-id";
import { nowIso } from "./clock";

const reportsByKey = new Map<string, Report>();

export function createMemoryTrustPort(): TrustPort {
  return {
    async reportUser(reporterId, targetUserId, reason, idempotency) {
      await simulateLatency();
      maybeInjectFault("reportUser");

      if (!isFirstUse("reportUser", idempotency.idempotencyKey)) {
        const cached = reportsByKey.get(idempotency.idempotencyKey);
        if (cached) return cached;
      }
      if (reporterId === targetUserId) {
        throw new Error("You can't report yourself");
      }
      const trimmedReason = reason.trim();
      if (!trimmedReason) {
        throw new Error("Say what happened, so we can look into it");
      }

      const report: Report = {
        id: nextId("rp"),
        reporterId,
        targetUserId,
        reason: trimmedReason,
        at: nowIso(),
      };
      reports.push(report);
      reportsByKey.set(idempotency.idempotencyKey, report);
      return report;
    },

    async blockUser(userId, blockedId, idempotency) {
      await simulateLatency();
      maybeInjectFault("blockUser");
      if (!isFirstUse("blockUser", idempotency.idempotencyKey)) return;
      if (userId === blockedId) {
        throw new Error("You can't block yourself");
      }
      let set = blockedUserIds.get(userId);
      if (!set) {
        set = new Set();
        blockedUserIds.set(userId, set);
      }
      set.add(blockedId);
    },

    async listBlockedUserIds(userId) {
      await simulateLatency();
      maybeInjectFault("listBlockedUserIds");
      return Array.from(blockedUserIds.get(userId) ?? []);
    },
  };
}
