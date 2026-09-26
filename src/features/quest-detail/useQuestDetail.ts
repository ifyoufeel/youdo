/* Quest detail's data hook: the quest itself, every offer on it, and the
   poster's profile (for the trust panel) — plus the two pure derivations
   every screen/guard here reads instead of comparing ids directly
   (roleOn, addressVisibleTo, both already real since Phase 0/lifecycle.ts
   was ported in M0). */
import { useQuery } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { roleOn, addressVisibleTo, myOfferOn } from "@data/domain/lifecycle";

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

  async function refetch() {
    await Promise.all([questQuery.refetch(), offersQuery.refetch()]);
  }

  return {
    quest,
    poster: posterQuery.data ?? null,
    offers,
    role,
    addressVisible,
    myOffer,
    // Gated on authStatus too — role/addressVisible fall back to a
    // signed-out "visitor" derivation while auth is still resolving
    // (same "loading" vs "signedOut" distinction AuthSessionProvider's
    // own header comment calls out), and on posterQuery so the trust
    // panel doesn't flash in a beat after the rest of the screen.
    isLoading: authStatus === "loading" || questQuery.isLoading || offersQuery.isLoading || posterQuery.isLoading,
    isError: questQuery.isError || offersQuery.isError,
    refetch,
  };
}
