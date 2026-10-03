/* Real as of M7 (scaffold — never run against a live project). Same
   "small, effectively static" shape as categories.ts. */
import type { AreasPort } from "../../ports/areas";
import { supabase } from "./client";
import type { AreaRow } from "./database.types";

export function createSupabaseAreasPort(): AreasPort {
  return {
    async listAreas() {
      const { data, error } = await supabase().from("areas").select("name, point_x, point_y").order("name");
      if (error) throw error;
      return ((data ?? []) as AreaRow[]).map((row) => ({ name: row.name, point: { x: row.point_x, y: row.point_y } }));
    },
  };
}
