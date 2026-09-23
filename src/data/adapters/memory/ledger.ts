import type { LedgerPort } from "../../ports/ledger";
import { NotImplementedYet } from "./not-implemented";

/* ADR-005's ledger only has entries to move once M5 wires escrow
   hold/release to the quest lifecycle mutations — stubbed until then. */
export function createMemoryLedgerPort(): LedgerPort {
  return {
    async listEntriesForUser() {
      throw new NotImplementedYet("listEntriesForUser", "M5");
    },
    async balanceOf() {
      throw new NotImplementedYet("balanceOf", "M5");
    },
    async deposit() {
      throw new NotImplementedYet("deposit", "M5");
    },
    async cashOut() {
      throw new NotImplementedYet("cashOut", "M5");
    },
  };
}
