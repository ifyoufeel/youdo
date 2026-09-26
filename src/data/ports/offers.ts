import type { Offer, Quest } from "../contracts";
import type { Idempotent } from "./common";

export interface OffersPort {
  /** Bounded per quest (PRD §7.3: one active offer per doer), never large
      enough to need pagination — unlike listQuests/listUsers. */
  listOffersForQuest(questId: string): Promise<Offer[]>;
  myOfferOnQuest(questId: string, doerId: string): Promise<Offer | null>;

  sendOffer(questId: string, doerId: string, amountMinor: number, note: string, idempotency: Idempotent): Promise<Offer>;
  withdrawOffer(offerId: string, idempotency: Idempotent): Promise<Offer>;
  declineOffer(offerId: string, idempotency: Idempotent): Promise<Offer>;
  /** The only action in the app that moves money (ADR-008's Flows
      gallery script says so explicitly) — accepting creates the escrow
      hold, auto-declines every other pending offer on the quest, and
      reveals the address to the accepted doer. All three happen
      together, so both changed records come back together too. */
  acceptOffer(offerId: string, idempotency: Idempotent): Promise<{ offer: Offer; quest: Quest }>;
}
