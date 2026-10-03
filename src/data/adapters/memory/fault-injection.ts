/* ADR-004's fault-injection toggle: lets a dev/preview session exercise
   error states (a failed load, a failed mutation) without a real backend
   ever being down. Off by default — only the preview route group's
   ClockControl-style dev strip (Phase 7) is expected to ever call
   setFaultInjectionRate. */
let rate = 0;

export function setFaultInjectionRate(nextRate: number): void {
  if (nextRate < 0 || nextRate > 1) {
    throw new Error(`Fault injection rate must be within [0, 1], got ${nextRate}`);
  }
  rate = nextRate;
}

export function getFaultInjectionRate(): number {
  return rate;
}

export function maybeInjectFault(operation: string): void {
  if (Math.random() < rate) {
    throw new Error(`Injected fault: ${operation} failed (fault injection rate ${rate}).`);
  }
}
