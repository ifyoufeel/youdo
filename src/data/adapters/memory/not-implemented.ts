/* Every port method the memory adapter doesn't implement yet still exists
   on the object (so the adapter is genuinely type-complete against every
   port — nothing silently missing) and throws this, tagged with the
   milestone that's expected to implement it, per docs/ROADMAP.md. Throwing
   with a milestone name is deliberately louder than a TODO comment: a
   caller that reaches a stub finds out immediately which real work is
   still pending, not just that something didn't happen. */
export class NotImplementedYet extends Error {
  constructor(method: string, milestone: string) {
    super(`${method} is not implemented yet — that's ${milestone} work (see docs/ROADMAP.md).`);
    this.name = "NotImplementedYet";
  }
}
