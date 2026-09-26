/* Applied filters/sort — the source of truth FilterSortSheet writes to on
   "Show quests" and useQuestsFeed reads from. Hydrated from AsyncStorage
   on mount so a remount (app relaunch, tab re-entry) picks up where the
   viewer left off, mirroring preview/app.js's own BrowseScreen: an
   in-sheet draft (owned by FilterSortSheet itself, not here) is applied
   all at once, never per-keystroke. */
import { useCallback, useEffect, useState } from "react";
import { getItem, setItem } from "@lib/storage";
import type { QuestSort } from "@data/ports/quests";

export interface BrowseFilterValues {
  radiusM: number;
  minPayMinor: number;
  todayOnly: boolean;
  verifiedPostersOnly: boolean;
}

export interface BrowseFilterState {
  filters: BrowseFilterValues;
  sort: QuestSort;
}

export const DEFAULT_FILTERS: BrowseFilterValues = {
  radiusM: 5000,
  minPayMinor: 0,
  todayOnly: false,
  verifiedPostersOnly: false,
};
export const DEFAULT_SORT: QuestSort = "closest";
const DEFAULT_STATE: BrowseFilterState = { filters: DEFAULT_FILTERS, sort: DEFAULT_SORT };

const STORAGE_KEY = "youdo.browseFilters.v1";

export function isDefaultFilters(state: BrowseFilterState): boolean {
  return (
    state.sort === DEFAULT_SORT &&
    state.filters.radiusM === DEFAULT_FILTERS.radiusM &&
    state.filters.minPayMinor === DEFAULT_FILTERS.minPayMinor &&
    state.filters.todayOnly === DEFAULT_FILTERS.todayOnly &&
    state.filters.verifiedPostersOnly === DEFAULT_FILTERS.verifiedPostersOnly
  );
}

export function useBrowseFilters() {
  const [state, setState] = useState<BrowseFilterState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getItem<BrowseFilterState>(STORAGE_KEY).then((stored) => {
      if (cancelled) return;
      if (stored) setState(stored);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const apply = useCallback(async (next: BrowseFilterState) => {
    setState(next);
    await setItem(STORAGE_KEY, next);
  }, []);

  const reset = useCallback(() => apply(DEFAULT_STATE), [apply]);

  const widenRadius = useCallback(
    () => apply({ ...state, filters: { ...state.filters, radiusM: 10000 } }),
    [apply, state]
  );

  return { ...state, hydrated, apply, reset, widenRadius, isDefault: isDefaultFilters(state) };
}
