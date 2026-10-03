/* ADR-004's non-negotiables, shared by every port below: async everywhere,
   cursor pagination, a subscribe() shape, idempotencyKey on mutations.
   The memory adapter (M0) honors the types; most of the actual jitter/
   fault-injection/subscribe plumbing lives in its implementation, not
   here — these are the contracts every adapter (memory today, Supabase at
   M7) has to satisfy identically. */

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PageParams {
  cursor?: string | null;
  limit?: number;
}

/** Every mutation takes one, so a retried request (a flaky connection
    resubmitting the same tap) is a no-op the second time, not a double
    charge or a duplicate offer. The memory adapter tracks seen keys per
    method; Supabase's will likely use a unique constraint instead — the
    port only promises the parameter exists and is honored. */
export interface Idempotent {
  idempotencyKey: string;
}

/** Every *Port exposes one of these for the records it owns. `unsubscribe`
    is always synchronous — nothing about tearing down a listener should
    need a round trip. Real payloads only exist once the Supabase adapter
    is realtime-backed (M7); the memory adapter's subscribe is a typed
    no-op that still satisfies the interface, per ADR-004's "the shape
    exists from day one even though the memory adapter mostly ignores it." */
export interface Subscription {
  unsubscribe(): void;
}
