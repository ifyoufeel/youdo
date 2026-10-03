/* Every quest the signed-in user is engaged with, bucketed for the three
   My-quests tabs. Mirrors usePosters.ts's own client-side-join shape —
   one listOffersForQuest per returned quest, joined here rather than
   server-side (no such join exists yet, ADR-004) — fine at fixture
   scale, same reasoning listSavedQuestIds gives for skipping
   pagination. A second, smaller N+1 does the same for myReviewOnQuest,
   scoped to paid quests only (the only status bucketOf's carve-out
   actually needs it for) rather than every quest — cheap even at this
   scale, and paid quests are a small subset of a small list. */
import { useQuery, useQueries } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { usePosters } from "@features/browse/usePosters";
import {
  roleOn,
  bucketOf,
  counterpartIdOn,
  acceptedOfferFor,
  myOfferOn,
  pendingOffersFor,
  type Role,
  type Bucket,
} from "@data/domain/lifecycle";
import type { Quest, Offer, Review, User } from "@data/contracts";

export interface MyQuestEngagement {
  quest: Quest;
  role: Role;
  bucket: Bucket;
  amountMinor: number;
  counterpart: User | null;
  pendingOfferCount: number;
}

export function useMyQuests() {
  const repository = useRepository();
  const { session } = useAuthSession();
  const userId = session?.userId;

  const questsQuery = useQuery({
    queryKey: ["quests", "mine", userId],
    queryFn: () => repository.listMyQuests(userId as string),
    enabled: !!userId,
  });
  const quests = questsQuery.data ?? [];

  const offersResults = useQueries({
    queries: quests.map((q) => ({
      queryKey: ["offers", "forQuest", q.id],
      queryFn: () => repository.listOffersForQuest(q.id),
    })),
  });
  const offersByQuest = new Map<string, Offer[]>();
  quests.forEach((q, i) => offersByQuest.set(q.id, offersResults[i]?.data ?? []));

  const paidQuests = quests.filter((q) => q.status === "paid");
  const reviewResults = useQueries({
    queries: paidQuests.map((q) => ({
      queryKey: ["reviews", "mine", q.id, userId],
      queryFn: () => repository.myReviewOnQuest(q.id, userId as string),
      enabled: !!userId,
    })),
  });
  const myReviewByQuest = new Map<string, Review | null>();
  paidQuests.forEach((q, i) => myReviewByQuest.set(q.id, reviewResults[i]?.data ?? null));

  const derived = userId
    ? quests.map((quest) => {
        const offers = offersByQuest.get(quest.id) ?? [];
        const accepted = acceptedOfferFor(offers, quest);
        const mine = myOfferOn(offers, quest.id, userId);
        return {
          quest,
          role: roleOn(offers, quest, userId),
          bucket: bucketOf(offers, quest, userId, myReviewByQuest.get(quest.id) ?? null),
          amountMinor: accepted?.amountMinor ?? mine?.amountMinor ?? quest.payoutMinor,
          counterpartId: counterpartIdOn(offers, quest, userId),
          pendingOfferCount: pendingOffersFor(offers, quest.id).length,
        };
      })
    : [];

  const counterpartIds = derived.map((d) => d.counterpartId).filter((id): id is string => !!id);
  const counterparts = usePosters(counterpartIds);

  const engagements: MyQuestEngagement[] = derived.map((d) => ({
    quest: d.quest,
    role: d.role,
    bucket: d.bucket,
    amountMinor: d.amountMinor,
    counterpart: d.counterpartId ? (counterparts.get(d.counterpartId) ?? null) : null,
    pendingOfferCount: d.pendingOfferCount,
  }));

  const buckets: Record<Bucket, MyQuestEngagement[]> = { active: [], offers: [], done: [] };
  for (const e of engagements) buckets[e.bucket].push(e);

  return {
    buckets,
    isLoading: questsQuery.isLoading || offersResults.some((r) => r.isLoading) || reviewResults.some((r) => r.isLoading),
    isError: questsQuery.isError,
    refetch: questsQuery.refetch,
  };
}
