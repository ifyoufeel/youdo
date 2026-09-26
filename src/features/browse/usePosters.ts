/* listQuests returns bare Quest records (posterId only, ADR-004 — no
   server-side join exists yet), so the poster trust info QuestCard's
   "spacious" variant shows (name/rating/questsCompleted/verified) is
   joined here, client-side, one getUser() per unique poster in the
   current page — same shape a real join would take the place of once
   the Supabase adapter (M7) can do it server-side. */
import { useQueries } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import type { User } from "@data/contracts";

export function usePosters(posterIds: string[]): Map<string, User> {
  const repository = useRepository();
  const uniqueIds = Array.from(new Set(posterIds));

  const results = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ["users", id],
      queryFn: () => repository.getUser(id),
      staleTime: 60_000,
    })),
  });

  const map = new Map<string, User>();
  uniqueIds.forEach((id, index) => {
    const user = results[index]?.data;
    if (user) map.set(id, user);
  });
  return map;
}
