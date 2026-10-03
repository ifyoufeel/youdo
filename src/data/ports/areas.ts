import type { Point } from "../contracts";

/** One of Taipei's districts, with the flat-grid point new quests in it
    get posted at (PRD's own "district, not street" resolution for
    anything a stranger sees before an offer is accepted). Small and
    effectively static — same "no pagination" reasoning CategoriesPort's
    own header comment gives. First real caller is the posting wizard's
    "Where" step (M3), choosing both quest.area (display) and quest.point
    (distance math) from the one selection. */
export interface Area {
  name: string;
  point: Point;
}

export interface AreasPort {
  listAreas(): Promise<Area[]>;
}
