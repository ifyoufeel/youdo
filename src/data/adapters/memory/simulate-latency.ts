/* ADR-004: every memory-adapter call awaits a jittered delay so the app
   never accidentally depends on the memory adapter's unrealistic instant
   response — a screen that only "works" because data.taiwan.js resolves
   synchronously would break the moment the Supabase adapter (M7) replaces
   it. 120-400ms mirrors a nearby-region REST round trip. */
const MIN_MS = 120;
const MAX_MS = 400;

export function simulateLatency(): Promise<void> {
  const ms = MIN_MS + Math.random() * (MAX_MS - MIN_MS);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
