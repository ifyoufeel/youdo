/* Real as of M7 (scaffold — never run against a live project). Small and
   effectively static (ports/categories.ts's own header comment), so this
   is a plain select — no RLS write path exists for this table at all
   (categories_select is the only policy, Phase 1's migration). */
import type { CategoriesPort } from "../../ports/categories";
import { supabase } from "./client";
import type { CategoryRow } from "./database.types";

export function createSupabaseCategoriesPort(): CategoriesPort {
  return {
    async listCategories() {
      const { data, error } = await supabase().from("categories").select("id, label").order("id");
      if (error) throw error;
      return ((data ?? []) as CategoryRow[]).map((row) => ({ id: row.id, label: row.label }));
    },
  };
}
