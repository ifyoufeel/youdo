/* The category chip row's data — a small, effectively-static list (see
   CategoriesPort's own header comment), so a long staleTime is correct
   rather than a workaround. */
import { useQuery } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";

export function useCategories() {
  const repository = useRepository();
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => repository.listCategories(),
    staleTime: Infinity,
  });
}
