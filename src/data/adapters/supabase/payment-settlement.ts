/* Mirrors src/data/adapters/memory/payment-settlement.ts's shape exactly
   (jittered timer + flushSettlementsForTests escape hatch) — the
   difference is what `settle` does once the timer fires: the memory
   adapter mutates local state directly, this one calls the
   settle_payment RPC (supabase/migrations/..._ledger_functions.sql),
   since there is no live project to run a real webhook/cron against
   (M7's "scaffold only" scope). That migration's own header comment
   explains why a client-driven settle call is safe here: settle_payment
   re-validates everything server-side before writing a single ledger
   entry. */
const MIN_MS = 800;
const MAX_MS = 1600;

const scheduled = new Map<string, { timer: ReturnType<typeof setTimeout>; settle: () => void | Promise<void> }>();

export function scheduleSettlement(paymentId: string, settle: () => void | Promise<void>): void {
  const delay = MIN_MS + Math.random() * (MAX_MS - MIN_MS);
  const timer = setTimeout(() => {
    scheduled.delete(paymentId);
    void settle();
  }, delay);
  scheduled.set(paymentId, { timer, settle });
}

/** Test-only: runs every still-pending settlement immediately instead of
    waiting out the real jitter. Call in afterEach — an unflushed timer
    otherwise leaks across tests in the same file. Returns the promises
    so a test can await every settlement's RPC call finishing, not just
    that the timer fired. */
export function flushSettlementsForTests(): Promise<void>[] {
  const pending = [...scheduled.values()];
  scheduled.clear();
  return pending.map(({ timer, settle }) => {
    clearTimeout(timer);
    return Promise.resolve(settle());
  });
}
