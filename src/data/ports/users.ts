import type { User } from "../contracts";
import type { Point } from "../contracts/geo";
import type { Page, PageParams, Idempotent } from "./common";

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  area?: string;
  /** Moving area moves the point every distance is measured from — the
      two always travel together (Settings' own area Select does this in
      one call, never area alone), so this is the same shape as the
      prototype's own `app.updateProfile({area, home})`. */
  home?: Point;
  phone?: string;
  email?: string;
}

export interface UsersPort {
  getUser(id: string): Promise<User | null>;
  /** Small and dev-relevant today (the actor switcher, ADR-008), but a
      real user directory is exactly the kind of collection ADR-004 wants
      paginated from day one rather than retrofitted once it's large. */
  listUsers(params: PageParams): Promise<Page<User>>;
  updateProfile(userId: string, patch: UpdateProfileInput, idempotency: Idempotent): Promise<User>;
  /** PRD §7.9's account deletion: anonymizes the account's own PII fields
      (name/bio/phone/email/bank) — naturally idempotent, no result to
      replay. Every past quest/offer only ever stores this user's id, so
      anonymizing the User record is enough to anonymize "the quests you
      were part of" everywhere that record gets resolved — no separate
      walk over quests/offers needed. The caller signs the session out
      afterward; that's a session concern, not this port's. */
  deleteAccount(userId: string, idempotency: Idempotent): Promise<void>;
}
