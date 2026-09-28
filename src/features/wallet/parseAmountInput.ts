/* Pure — the same "NT$ text field to minor units" arithmetic OfferSheet
   and CashOutSheet's prototype ancestor both do inline
   (Math.max(0, Math.round(parseFloat(text || "0") * 100))), pulled out
   once a second sheet (DepositSheet, CashOutSheet) needs it. */
export function parseAmountInput(text: string): number {
  return Math.max(0, Math.round(parseFloat(text || "0") * 100));
}
