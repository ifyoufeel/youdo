/* ADR-009's "time is a value in the store, never Date.now()" — the memory
   adapter's one clock, anchored to seed.now (not the device clock). The
   seed fixture is dated 2026-09-16; a sweep run against the device clock
   would expire most of the open feed and auto-pay q7 the instant it ran,
   since real device time is well past that. Every mutation-path timestamp
   in this adapter reads nowIso()/nowMs() instead of `new Date()` — see the
   grep this file's own PR description names — so the whole data layer
   moves together, only when advanceClock() is called. */
import { seed } from "./seed";

let current = Date.parse(seed.now);
const listeners = new Set<() => void>();

export function nowMs(): number {
  return current;
}

export function nowIso(): string {
  return new Date(current).toISOString();
}

export function subscribeClock(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Moves the clock forward and notifies subscribers. Only a positive,
    finite delta is a real "time passed" — anything else is a caller bug,
    not a clock state to silently absorb. */
export function moveClock(deltaMs: number): void {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
    throw new Error("moveClock: deltaMs must be a positive, finite number");
  }
  current += deltaMs;
  for (const fn of listeners) fn();
}

export function resetClockForTests(ms: number = Date.parse(seed.now)): void {
  current = ms;
}
