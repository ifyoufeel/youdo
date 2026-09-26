import type { AreasPort } from "../../ports/areas";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { areas } from "./store";

export function createMemoryAreasPort(): AreasPort {
  return {
    async listAreas() {
      await simulateLatency();
      maybeInjectFault("listAreas");
      return areas;
    },
  };
}
