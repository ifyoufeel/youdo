import type { User } from "../contracts";
import type { Page, PageParams, Idempotent } from "./common";

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  area?: string;
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
}
