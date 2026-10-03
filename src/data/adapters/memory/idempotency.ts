/* ADR-004's Idempotent contract, honored for real for the first time here
   (Phase 0 of M1 — save/unsave are the memory adapter's first real
   mutating methods): a retried mutation — the same idempotencyKey
   resubmitted, e.g. by a flaky connection retrying a tap — is a no-op the
   second time, not a duplicate side effect. One Map of seen keys per
   method name, shared by every mutating memory-adapter method that takes
   an Idempotent. Future mutations (M2's postQuest/offers) reuse this same
   helper rather than each reinventing key tracking. */
const seenKeys = new Map<string, Set<string>>();

/** Returns true the first time a given (method, key) pair is seen, false
    on every replay — callers skip their side effect on false. */
export function isFirstUse(method: string, idempotencyKey: string): boolean {
  let keys = seenKeys.get(method);
  if (!keys) {
    keys = new Set();
    seenKeys.set(method, keys);
  }
  if (keys.has(idempotencyKey)) return false;
  keys.add(idempotencyKey);
  return true;
}

/** Test-only: clears all tracked keys so tests don't leak idempotency
    state into each other via this module's shared Map. */
export function resetIdempotencyForTests(): void {
  seenKeys.clear();
}
