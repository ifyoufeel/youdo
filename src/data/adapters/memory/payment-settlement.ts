/* Simulates a payment provider's webhook — deposit/cashOut return a
   `pending` Payment immediately, and this is what "delivers the webhook"
   later, jittered like simulate-latency.ts's own round-trip delay so a
   payment genuinely sits in `pending` for a beat, not just as an internal
   implementation detail (ADR-005/ADR-013: "a mock that resolves
   synchronously would model a world that doesn't exist"). */
const MIN_MS = 800;
const MAX_MS = 1600;

const scheduled = new Map<string, { timer: ReturnType<typeof setTimeout>; settle: () => void }>();

export function scheduleSettlement(paymentId: string, settle: () => void): void {
  const delay = MIN_MS + Math.random() * (MAX_MS - MIN_MS);
  const timer = setTimeout(() => {
    scheduled.delete(paymentId);
    settle();
  }, delay);
  scheduled.set(paymentId, { timer, settle });
}

/** Test-only: runs every still-pending settlement synchronously instead
    of waiting out the real jitter, so adapter tests stay deterministic.
    Call in afterEach — an unflushed timer otherwise leaks across tests in
    the same file. */
export function flushSettlementsForTests(): void {
  const pending = [...scheduled.values()];
  scheduled.clear();
  for (const { timer, settle } of pending) {
    clearTimeout(timer);
    settle();
  }
}
