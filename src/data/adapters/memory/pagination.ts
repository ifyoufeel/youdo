import type { Page, PageParams } from "../../ports/common";

const DEFAULT_LIMIT = 20;

/** Cursor is just the next start index as a string — an implementation
    detail of this adapter, never parsed by a caller (ADR-004 only
    promises the Page<T>/PageParams shape, not cursor internals). */
export function paginate<T>(items: T[], params: PageParams): Page<T> {
  const limit = params.limit ?? DEFAULT_LIMIT;
  const start = params.cursor ? Number(params.cursor) : 0;
  const slice = items.slice(start, start + limit);
  const nextStart = start + slice.length;
  return {
    items: slice,
    nextCursor: nextStart < items.length ? String(nextStart) : null,
  };
}
