/* Mirrors useCategories.ts exactly — a small, effectively-static
   reference list, long staleTime rather than a workaround. */
import { useQuery } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";

export function useAreas() {
  const repository = useRepository();
  return useQuery({
    queryKey: ["areas"],
    queryFn: () => repository.listAreas(),
    staleTime: Infinity,
  });
}
