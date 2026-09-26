import type { Repository } from "../../repository";
import { createMemoryAuthPort } from "./auth";
import { createMemoryUsersPort } from "./users";
import { createMemoryQuestsPort } from "./quests";
import { createMemoryOffersPort } from "./offers";
import { createMemoryThreadsPort } from "./threads";
import { createMemoryLedgerPort } from "./ledger";
import { createMemoryReviewsPort } from "./reviews";
import { createMemoryNotificationsPort } from "./notifications";
import { createMemoryCategoriesPort } from "./categories";

export { setFaultInjectionRate, getFaultInjectionRate } from "./fault-injection";

export function createMemoryAdapter(): Repository {
  return {
    ...createMemoryAuthPort(),
    ...createMemoryUsersPort(),
    ...createMemoryQuestsPort(),
    ...createMemoryOffersPort(),
    ...createMemoryThreadsPort(),
    ...createMemoryLedgerPort(),
    ...createMemoryReviewsPort(),
    ...createMemoryNotificationsPort(),
    ...createMemoryCategoriesPort(),
  };
}
