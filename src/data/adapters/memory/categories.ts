import type { CategoriesPort } from "../../ports/categories";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { categories } from "./store";

export function createMemoryCategoriesPort(): CategoriesPort {
  return {
    async listCategories() {
      await simulateLatency();
      maybeInjectFault("listCategories");
      return categories;
    },
  };
}
