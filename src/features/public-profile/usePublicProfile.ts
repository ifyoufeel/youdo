/* Someone else's profile: identity, trust badges, open quests, and
   what people said about them. Reuses listMyQuests (already real since
   M3) filtered to this user's own open posts, rather than adding a new
   port method — the same "promote once a second consumer needs it" call
   this codebase already makes at the component level, applied to a port
   read instead. listReviewsForUser already applies the reveal rule
   server-side (see its own port comment) — nothing to filter here.
   Review authors are resolved via usePosters, its second real consumer
   beyond BrowseScreen's poster trust info. */
import { useQuery } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { usePosters } from "@features/browse/usePosters";

export function usePublicProfile(userId: string) {
  const repository = useRepository();
  const { session } = useAuthSession();

  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => repository.getUser(userId),
  });

  const questsQuery = useQuery({
    queryKey: ["quests", "mine", userId],
    queryFn: () => repository.listMyQuests(userId),
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", "for", userId],
    queryFn: () => repository.listReviewsForUser(userId),
  });

  const openQuests = (questsQuery.data ?? []).filter((q) => q.posterId === userId && q.status === "open");
  const visibleReviews = reviewsQuery.data ?? [];
  const raters = usePosters(visibleReviews.map((r) => r.raterId));

  return {
    user: userQuery.data ?? null,
    openQuests,
    visibleReviews,
    raters,
    viewerId: session?.userId,
    isLoading: userQuery.isLoading || questsQuery.isLoading || reviewsQuery.isLoading,
    isError: userQuery.isError || questsQuery.isError || reviewsQuery.isError,
    refetch: userQuery.refetch,
  };
}
