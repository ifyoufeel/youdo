import { TRANSITIONS, canTransition, roleOn, isClosed, statusMeta, myOfferOn, acceptedOfferFor } from "./lifecycle";
import type { Quest, Offer, QuestStatus } from "../contracts";

const ALL_STATUSES: QuestStatus[] = [
  "draft", "open", "assigned", "in_progress", "completed", "paid", "cancelled", "expired", "disputed",
];
const ALL_ACTORS = ["poster", "doer", "applicant", "visitor", "system", "admin"] as const;

describe("TRANSITIONS — every legal edge succeeds for its named actor(s), and is refused for every other actor", () => {
  for (const t of TRANSITIONS) {
    for (const actor of ALL_ACTORS) {
      const legal = t.actor.includes(actor);
      it(`${t.from} -> ${t.to} as ${actor}: ${legal ? "allowed" : "refused"}`, () => {
        const result = canTransition(t.from, t.to, actor);
        if (legal) expect(result).toEqual(t);
        else expect(result).toBeNull();
      });
    }
  }
});

describe("canTransition — every (from, to) pair NOT in the table is refused for every actor", () => {
  it("an exhaustive sweep over all status pairs finds no undeclared transition", () => {
    for (const from of ALL_STATUSES) {
      for (const to of ALL_STATUSES) {
        const declared = TRANSITIONS.some((t) => t.from === from && t.to === to);
        if (declared) continue;
        for (const actor of ALL_ACTORS) {
          expect(canTransition(from, to, actor)).toBeNull();
        }
      }
    }
  });
});

describe("isClosed", () => {
  it("paid, cancelled, expired are closed; everything else is open", () => {
    expect(isClosed("paid")).toBe(true);
    expect(isClosed("cancelled")).toBe(true);
    expect(isClosed("expired")).toBe(true);
    for (const s of ["draft", "open", "assigned", "in_progress", "completed", "disputed"] as QuestStatus[]) {
      expect(isClosed(s)).toBe(false);
    }
  });
});

describe("statusMeta", () => {
  it("covers every status with no fallback needed", () => {
    for (const s of ALL_STATUSES) {
      expect(statusMeta(s).label).toBeTruthy();
    }
  });
});

/* ---- roleOn, exercised against real-shaped fixtures ---- */

function quest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: "q1",
    posterId: "u1",
    title: "Walk Biscuit for an hour",
    payoutMinor: 40000,
    payoutUnit: "fixed",
    categoryId: "dog-walking",
    point: { x: 0, y: 0 },
    estimatedMinutes: 60,
    scheduledFor: "2026-09-16T18:00:00+08:00",
    expiresAt: "2026-09-16T17:00:00+08:00",
    createdAt: "2026-09-15T20:10:00+08:00",
    status: "open",
    acceptedOfferId: null,
    addressLine: "14B, Lane 31, Yongkang St",
    area: "Da'an",
    details: "",
    requirements: [],
    ...overrides,
  };
}

function offer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: "o1",
    questId: "q1",
    doerId: "u0",
    amountMinor: 40000,
    status: "pending",
    note: "",
    createdAt: "2026-09-15T21:02:00+08:00",
    respondedAt: null,
    ...overrides,
  };
}

describe("roleOn", () => {
  it("the poster is 'poster', regardless of offers", () => {
    const q = quest({ posterId: "u1" });
    expect(roleOn([], q, "u1")).toBe("poster");
  });

  it("the accepted offer's doer is 'doer'", () => {
    const q = quest({ acceptedOfferId: "o1" });
    const offers = [offer({ id: "o1", doerId: "u0", status: "accepted" })];
    expect(roleOn(offers, q, "u0")).toBe("doer");
  });

  it("someone with a pending offer but not accepted is 'applicant'", () => {
    const q = quest({ acceptedOfferId: null });
    const offers = [offer({ id: "o1", doerId: "u0", status: "pending" })];
    expect(roleOn(offers, q, "u0")).toBe("applicant");
  });

  it("someone with a withdrawn/declined offer is back to 'visitor' — myOfferOn only counts pending/accepted", () => {
    const q = quest({ acceptedOfferId: null });
    const offers = [offer({ id: "o1", doerId: "u0", status: "withdrawn" })];
    expect(roleOn(offers, q, "u0")).toBe("visitor");
    expect(myOfferOn(offers, q.id, "u0")).toBeNull();
  });

  it("a stranger with no offer at all is 'visitor'", () => {
    expect(roleOn([], quest(), "u9")).toBe("visitor");
  });

  it("a null quest is always 'visitor'", () => {
    expect(roleOn([], null, "u0")).toBe("visitor");
  });

  it("acceptedOfferFor returns null when the quest has no acceptedOfferId", () => {
    expect(acceptedOfferFor([offer()], quest({ acceptedOfferId: null }))).toBeNull();
  });
});
