/* Shared by every memory-adapter method that mints a new record id
   (offers.ts's sendOffer/findOrCreateThread, now quests.ts's postQuest) —
   promoted here once a second consumer needed it, same threshold this
   codebase uses for design-system components. Dependency-free: crypto.
   randomUUID isn't guaranteed across every environment this adapter runs
   in (Hermes/web/jsdom), same reasoning src/lib/idempotency.ts's own
   newIdempotencyKey gives for not using it either. */
export function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
