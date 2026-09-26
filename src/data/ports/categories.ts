import type { Category } from "../contracts";

/** Small and effectively static (PRD's category list doesn't change per
    request), so no pagination — same reasoning UsersPort gives for why its
    own small collections stay unpaginated where ADR-004's "paginate from
    day one" doesn't apply. First real caller is Browse's category chip row
    (M1); quest posting (M2) reuses it for the same picker. */
export interface CategoriesPort {
  listCategories(): Promise<Category[]>;
}
