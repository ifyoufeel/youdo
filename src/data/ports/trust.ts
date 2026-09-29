import type { Report } from "../contracts";
import type { Idempotent } from "./common";

/** PRD §7.8's "Report and block on any user or quest" — the buildable
    slice is user-level only (the prototype's own PublicProfileScreen is
    the sole real trigger site, and it only ever targets a user, never a
    quest — see contracts/report.ts's header comment). No `unblockUser`:
    nothing in the product surfaces a "blocked users" list to unblock
    from yet, so building the method now would have no real caller. */
export interface TrustPort {
  reportUser(reporterId: string, targetUserId: string, reason: string, idempotency: Idempotent): Promise<Report>;
  /** Blocking is naturally idempotent (a Set add, not a create) — no
      result to replay, unlike reportUser. */
  blockUser(userId: string, blockedId: string, idempotency: Idempotent): Promise<void>;
  listBlockedUserIds(userId: string): Promise<string[]>;
}
