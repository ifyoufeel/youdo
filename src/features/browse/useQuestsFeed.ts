/* Browse's data hook: an infinite, cursor-paginated feed centered on the
   signed-in user's seeded `home` point (never a real GPS reading — see
   ADR-004/geo.ts's own note on why the memory adapter's grid can't mix
   with real lat/lng yet). `radiusM` is a fixed default here; Phase 9's
   filter sheet turns it (and sort/category/etc.) into a real, user-editable
   param threaded through this same query key. */
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import type { Quest } from "@data/contracts";

const DEFAULT_RADIUS_M = 5000;

export interface UseQuestsFeedParams {
  search?: string;
  categoryId?: string;
}

export function useQuestsFeed({ search, categoryId }: UseQuestsFeedParams = {}) {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const userId = session?.userId;

  const meQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => repository.getUser(userId as string),
    enabled: !!userId,
  });
  const center = meQuery.data?.home;

  const feedQuery = useInfiniteQuery({
    queryKey: ["quests", "feed", userId, center, search, categoryId],
    queryFn: ({ pageParam }) =>
      repository.listQuests({
        center: center!,
        radiusM: DEFAULT_RADIUS_M,
        search: search || undefined,
        categoryId,
        cursor: pageParam,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!center,
  });

  const savedQuery = useQuery({
    queryKey: ["savedQuestIds", userId],
    queryFn: () => repository.listSavedQuestIds(userId as string),
    enabled: !!userId,
  });

  const quests: Quest[] = feedQuery.data?.pages.flatMap((page) => page.items) ?? [];

  async function refresh() {
    await Promise.all([feedQuery.refetch(), savedQuery.refetch()]);
  }

  function invalidateSaved() {
    return queryClient.invalidateQueries({ queryKey: ["savedQuestIds", userId] });
  }

  return {
    quests,
    savedIds: new Set(savedQuery.data ?? []),
    isLoading: meQuery.isLoading || feedQuery.isLoading,
    isError: meQuery.isError || feedQuery.isError,
    isRefetching: feedQuery.isRefetching,
    hasNextPage: !!feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    fetchNextPage: () => feedQuery.fetchNextPage(),
    refresh,
    invalidateSaved,
  };
}
