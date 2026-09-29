/* Quest detail's data hook: the quest itself, every offer on it, and the
   poster's profile (for the trust panel) — plus the two pure derivations
   every screen/guard here reads instead of comparing ids directly
   (roleOn, addressVisibleTo, both already real since Phase 0/lifecycle.ts
   was ported in M0). M6 adds `counterpart` (whoever isn't the viewer —
   the poster query already covers a doer/applicant viewer, but a poster
   viewer needs the accepted doer's own User fetched separately) and
   `myReview` (gated to paid quests) for the "Leave a rating" slab. */
import { useQuery } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { roleOn, addressVisibleTo, myOfferOn, acceptedOfferFor } from "@data/domain/lifecycle";

export function useQuestDetail(questId: string) {
  const repository = useRepository();
  const { status: authStatus, session } = useAuthSession();
  const userId = session?.userId;

  const questQuery = useQuery({
    queryKey: ["quests", "detail", questId],
    queryFn: () => repository.getQuest(questId),
  });

  const offersQuery = useQuery({
    queryKey: ["offers", "forQuest", questId],
    queryFn: () => repository.listOffersForQuest(questId),
  });

  const quest = questQuery.data ?? null;
  const posterId = quest?.posterId;

  const posterQuery = useQuery({
    queryKey: ["users", posterId],
    queryFn: () => repository.getUser(posterId as string),
    enabled: !!posterId,
  });

  const offers = offersQuery.data ?? [];
  const role = userId ? roleOn(offers, quest, userId) : "visitor";
  const addressVisible = quest && userId ? addressVisibleTo(quest, offers, userId) : false;
  const myOffer = userId ? myOfferOn(offers, questId, userId) : null;

  // Only the poster branch needs a separate fetch — a doer/applicant
  // viewer's counterpart is always the poster, already fetched above.
  const counterpartId = role === "poster" ? (acceptedOfferFor(offers, quest)?.doerId ?? null) : null;
  const counterpartQuery = useQuery({
    queryKey: ["users", counterpartId],
    queryFn: () => repository.getUser(counterpartId as string),
    enabled: !!counterpartId,
  });
  const counterpart = role === "poster" ? (counterpartQuery.data ?? null) : (posterQuery.data ?? null);

  const myReviewQuery = useQuery({
    queryKey: ["reviews", "mine", questId, userId],
    queryFn: () => repository.myReviewOnQuest(questId, userId as string),
    enabled: !!userId && quest?.status === "paid",
  });

  async function refetch() {
    await Promise.all([questQuery.refetch(), offersQuery.refetch()]);
  }

  return {
    quest,
    poster: posterQuery.data ?? null,
    counterpart,
    myReview: myReviewQuery.data ?? null,
    offers,
    role,
    addressVisible,
    myOffer,
    // A genuinely signed-out visitor (no cold-start gate applies to a
    // direct deep link into this route) must never see offer CTAs that
    // assume a real userId — role alone can't distinguish that case,
    // since it also defaults to "visitor" while signed out.
    isSignedIn: authStatus === "signedIn",
    // Gated on authStatus too — role/addressVisible fall back to a
    // signed-out "visitor" derivation while auth is still resolving
    // (same "loading" vs "signedOut" distinction AuthSessionProvider's
    // own header comment calls out), and on posterQuery so the trust
    // panel doesn't flash in a beat after the rest of the screen.
    isLoading:
      authStatus === "loading" ||
      questQuery.isLoading ||
      offersQuery.isLoading ||
      posterQuery.isLoading ||
      counterpartQuery.isLoading ||
      myReviewQuery.isLoading,
    isError: questQuery.isError || offersQuery.isError,
    refetch,
  };
}
