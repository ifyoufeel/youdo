/* ADR-005: Money = { minor: integer, currency: 'TWD' }, integer minor
   units, never float, never a formatted string in the domain layer.
   formatMoney is the ONLY place a minor-unit integer becomes display text —
   enforced by convention here (test/rules.js already enforces the
   equivalent rule against the preview's own `Intl.NumberFormat` ban; this
   is the same one formatting boundary, ported).

   `currency` is a literal 'TWD' rather than a general ISO-4217 union —
   PRD §5 scopes this launch to TWD only; widening it is a real product
   decision (ADR-006's Chinese-localisation revisit territory), not
   something to pre-guess here. */
import { z } from "zod";

export const MoneySchema = z
  .object({
    minor: z.number().int(),
    currency: z.literal("TWD"),
  })
  .brand<"Money">();

export type Money = z.infer<typeof MoneySchema>;

export function money(minor: number): Money {
  return MoneySchema.parse({ minor, currency: "TWD" });
}

/** The one formatting boundary (PRD §11). TWD is nominally two-decimal but
    transacted in whole dollars, so minor units are dropped when zero —
    NT$400, never NT$400.00 (matches preview/app.js:36-42's formatMoney
    exactly, just typed). */
export function formatMoney(m: Money): string {
  const neg = m.minor < 0;
  const whole = Math.abs(m.minor) / 100;
  const s = whole % 1 === 0 ? String(whole) : whole.toFixed(2);
  const grouped = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "−" : "") + "NT$" + grouped;
}
