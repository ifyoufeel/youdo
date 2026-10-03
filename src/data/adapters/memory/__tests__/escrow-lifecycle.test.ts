/* M5's real exit criterion, as a test: post → offer → accept → start →
   done → confirm, exercising QuestsPort and OffersPort together against
   the same shared store, checking exact ledger deltas at every step. */
import { createMemoryQuestsPort } from "../quests";
import { createMemoryOffersPort } from "../offers";
import { ledger as ledgerStore } from "../store";
import { resetIdempotencyForTests } from "../idempotency";
import { balanceOf } from "../../../domain/ledger";
import type { PostQuestInput } from "../../../ports/quests";

function key(): { idempotencyKey: string } {
  return { idempotencyKey: Math.random().toString(36).slice(2) };
}

const POST_INPUT: PostQuestInput = {
  posterId: "u0",
  title: "Repaint a small bedroom",
  details: "One coat, walls only, paint already bought.",
  categoryId: "cleaning",
  payoutMinor: 50000,
  estimatedMinutes: 120,
  durationLabel: null,
  addressLine: "14B, Lane 31, Yongkang St",
  area: "Da'an",
  point: { x: 1920, y: -2260 },
  scheduledFor: "2026-09-20T14:00:00+08:00",
  expiresAt: "2026-09-20T13:00:00+08:00",
  requirements: [],
};

describe("escrow lifecycle: post -> offer -> accept -> start -> done -> confirm", () => {
  const quests = createMemoryQuestsPort();
  const offersPort = createMemoryOffersPort();

  afterEach(() => {
    resetIdempotencyForTests();
  });

  it("moves the exact amount poster -> held -> doer, fee deducted, every ledger entry sums to zero", async () => {
    const posterAvailableBefore = balanceOf(ledgerStore, "user_available", "u0");
    const posterHeldBefore = balanceOf(ledgerStore, "user_held", "u0");
    const doerAvailableBefore = balanceOf(ledgerStore, "user_available", "u3");
    const feeBefore = balanceOf(ledgerStore, "platform_fee", null);

    const posted = await quests.postQuest(POST_INPUT, key());
    expect(posted.status).toBe("open");

    const offer = await offersPort.sendOffer(posted.id, "u3", 50000, "I can start this afternoon.", key());
    expect(offer.status).toBe("pending");

    const accepted = await offersPort.acceptOffer(offer.id, key());
    expect(accepted.quest.status).toBe("assigned");
    // Held the instant an offer is accepted — the exit criterion's "post,
    // offer, accept" step, matching PRD §7.7's "funds are held when the
    // poster accepts an offer, not at posting."
    expect(balanceOf(ledgerStore, "user_available", "u0")).toBe(posterAvailableBefore - 50000);
    expect(balanceOf(ledgerStore, "user_held", "u0")).toBe(posterHeldBefore + 50000);

    const started = await quests.startQuest(posted.id, "u3", key());
    expect(started.status).toBe("in_progress");

    const done = await quests.markDone(posted.id, "u3", key());
    expect(done.status).toBe("completed");

    const confirmed = await quests.confirmDone(posted.id, "u0", key());
    expect(confirmed.status).toBe("paid");
    expect(confirmed.paidAt).toBeTruthy();

    // Released, minus the fee: held returns to its pre-accept baseline,
    // the doer receives net, the platform receives fee, and gross = held.
    const fee = 5000; // feeOn(50000), 10% floor
    const net = 45000; // 50000 - fee
    expect(balanceOf(ledgerStore, "user_held", "u0")).toBe(posterHeldBefore);
    expect(balanceOf(ledgerStore, "user_available", "u3")).toBe(doerAvailableBefore + net);
    expect(balanceOf(ledgerStore, "platform_fee", null)).toBe(feeBefore + fee);

    // Illegal transitions are still rejected — status agrees on both
    // sides, and there's no way back from "paid".
    await expect(quests.confirmDone(posted.id, "u0", key())).rejects.toThrow(/can't move this/);
    await expect(quests.startQuest(posted.id, "u3", key())).rejects.toThrow(/can't move this/);

    // Every transaction this whole flow created sums to zero, and the
    // ledger as a whole nets to zero across every account.
    const byTxn = new Map<string, number>();
    for (const e of ledgerStore) byTxn.set(e.txnId, (byTxn.get(e.txnId) ?? 0) + e.amountMinor);
    for (const [, sum] of byTxn) expect(sum).toBe(0);
    expect(ledgerStore.reduce((s, e) => s + e.amountMinor, 0)).toBe(0);
  });
});
