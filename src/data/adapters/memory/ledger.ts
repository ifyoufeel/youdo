/* ADR-005/ADR-013's deposit/cash-out: the only two LedgerPort mutations,
   and the only ones that ever create a Payment — hold/release/refund are
   ledger-internal side effects of a quest/offer transition (offers.ts,
   quests.ts, escrow.ts, Phase 3), never routed through here. Each returns
   a `pending` Payment immediately and settles asynchronously via
   payment-settlement.ts, exactly like a real webhook-driven provider. */
import type { LedgerPort } from "../../ports/ledger";
import type { Payment } from "../../contracts";
import { money, formatMoney } from "../../contracts";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";
import { isFirstUse } from "./idempotency";
import { ledger, payments, users } from "./store";
import { balanceOf, spendableOf, depositEntries, cashOutEntries } from "../../domain/ledger";
import { postTxn } from "./post-txn";
import { scheduleSettlement } from "./payment-settlement";
import { nextId } from "./next-id";
import { nowIso } from "./clock";
import { notify } from "./notify";

const paymentsByKey = new Map<string, Payment>();

export function createMemoryLedgerPort(): LedgerPort {
  return {
    async listEntriesForUser(userId) {
      await simulateLatency();
      maybeInjectFault("listEntriesForUser");
      return ledger.filter((e) => e.userId === userId);
    },

    async balanceOf(userId, account) {
      await simulateLatency();
      maybeInjectFault("balanceOf");
      return balanceOf(ledger, account, userId);
    },

    async listPaymentsForUser(userId) {
      await simulateLatency();
      maybeInjectFault("listPaymentsForUser");
      return payments
        .filter((p) => p.userId === userId)
        .slice()
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    },

    async deposit(userId, amountMinor, idempotency) {
      await simulateLatency();
      maybeInjectFault("deposit");

      if (!isFirstUse("deposit", idempotency.idempotencyKey)) {
        const cached = paymentsByKey.get(idempotency.idempotencyKey);
        if (cached) return { ...cached };
      }

      if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
        throw new Error("Add an amount above zero");
      }
      const user = users.get(userId);
      if (!user) throw new Error("Unknown user");

      const payment: Payment = {
        id: nextId("pay"),
        txnId: nextId("tx-topup"),
        kind: "deposit",
        userId,
        amountMinor,
        state: "pending",
        provider: "simulated",
        providerId: nextId("sim"),
        createdAt: nowIso(),
        settledAt: null,
      };
      payments.push(payment);
      paymentsByKey.set(idempotency.idempotencyKey, payment);

      scheduleSettlement(payment.id, () => {
        if (payment.state !== "pending") return;
        try {
          maybeInjectFault("settlePayment");
          postTxn(payment.txnId, depositEntries(userId, amountMinor, user.bank));
          payment.state = "succeeded";
          payment.settledAt = nowIso();
          notify(userId, "payment", null, `${formatMoney(money(amountMinor))} added to your wallet`);
        } catch {
          payment.state = "failed";
          payment.settledAt = nowIso();
          notify(userId, "payment", null, "A deposit didn't go through — nothing moved");
        }
      });

      return { ...payment };
    },

    async cashOut(userId, amountMinor, idempotency) {
      await simulateLatency();
      maybeInjectFault("cashOut");

      if (!isFirstUse("cashOut", idempotency.idempotencyKey)) {
        const cached = paymentsByKey.get(idempotency.idempotencyKey);
        if (cached) return { ...cached };
      }

      if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
        throw new Error("Cash out an amount you have available");
      }
      const user = users.get(userId);
      if (!user) throw new Error("Unknown user");
      if (amountMinor > spendableOf(ledger, payments, userId)) {
        throw new Error("Cash out an amount you have available");
      }

      const payment: Payment = {
        id: nextId("pay"),
        txnId: nextId("tx-cash"),
        kind: "cashout",
        userId,
        amountMinor,
        state: "pending",
        provider: "simulated",
        providerId: nextId("sim"),
        createdAt: nowIso(),
        settledAt: null,
      };
      payments.push(payment);
      paymentsByKey.set(idempotency.idempotencyKey, payment);

      scheduleSettlement(payment.id, () => {
        if (payment.state !== "pending") return;
        // Re-check at settlement time, not just at initiation — the
        // available balance can move between the two (another payout
        // settling first, an offer accepted in between).
        if (balanceOf(ledger, "user_available", userId) < amountMinor) {
          payment.state = "failed";
          payment.settledAt = nowIso();
          notify(userId, "payment", null, "A cash-out didn't go through — nothing moved");
          return;
        }
        try {
          maybeInjectFault("settlePayment");
          postTxn(payment.txnId, cashOutEntries(userId, amountMinor, user.bank));
          payment.state = "succeeded";
          payment.settledAt = nowIso();
          notify(userId, "payment", null, `${formatMoney(money(amountMinor))} is on its way to your bank`);
        } catch {
          payment.state = "failed";
          payment.settledAt = nowIso();
          notify(userId, "payment", null, "A cash-out didn't go through — nothing moved");
        }
      });

      return { ...payment };
    },
  };
}
