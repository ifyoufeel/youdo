import type { OffersPort } from "../../ports/offers";
import { NotImplementedYet } from "./not-implemented";

/* No screen exists yet to exercise offers (M2's send-offer flow) — every
   method is a typed stub so the adapter is complete against OffersPort
   without front-loading logic nothing calls. */
export function createMemoryOffersPort(): OffersPort {
  return {
    async listOffersForQuest() {
      throw new NotImplementedYet("listOffersForQuest", "M2");
    },
    async myOfferOnQuest() {
      throw new NotImplementedYet("myOfferOnQuest", "M2");
    },
    async sendOffer() {
      throw new NotImplementedYet("sendOffer", "M2");
    },
    async withdrawOffer() {
      throw new NotImplementedYet("withdrawOffer", "M2");
    },
    async declineOffer() {
      throw new NotImplementedYet("declineOffer", "M2");
    },
    async acceptOffer() {
      throw new NotImplementedYet("acceptOffer", "M2");
    },
  };
}
