/* Every *Port mutation takes an Idempotent — src/data/ports/common.ts's
   idempotencyKey — so a retried request never double-applies. `crypto.
   randomUUID` isn't guaranteed across Hermes/web/jsdom test environments,
   so this stays a plain, dependency-free generator: good enough for a key
   that only needs to be unique per attempt, never cryptographically
   secure. */
export function newIdempotencyKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
