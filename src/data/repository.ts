import type { AuthPort } from "./ports/auth";
import type { UsersPort } from "./ports/users";
import type { QuestsPort } from "./ports/quests";
import type { OffersPort } from "./ports/offers";
import type { ThreadsPort } from "./ports/threads";
import type { LedgerPort } from "./ports/ledger";
import type { ReviewsPort } from "./ports/reviews";
import type { NotificationsPort } from "./ports/notifications";
import type { CategoriesPort } from "./ports/categories";
import type { AreasPort } from "./ports/areas";

/** The full surface every adapter (memory today, Supabase at M7) must
    satisfy identically — the one type composition-root.tsx hands out via
    useRepository(), per ADR-004. */
export type Repository = AuthPort &
  UsersPort &
  QuestsPort &
  OffersPort &
  ThreadsPort &
  LedgerPort &
  ReviewsPort &
  NotificationsPort &
  CategoriesPort &
  AreasPort;
