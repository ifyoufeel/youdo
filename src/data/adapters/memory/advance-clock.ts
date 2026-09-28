/* The one entry point that moves the memory adapter's clock — dev-only
   plumbing (composition-root re-exports it for app/(preview)'s DevStrip),
   never called from a real user-facing screen. M5 Phase 4 adds the sweep
   (expire stale open quests, auto-release completed ones past the 72h
   confirm window) after the clock itself moves. */
import { moveClock } from "./clock";

export function advanceClock(deltaMs: number): void {
  moveClock(deltaMs);
}
