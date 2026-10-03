/* Per-category notification toggles (PRD §7.9) — persisted for real via
   AsyncStorage, mirroring useBrowseFilters.ts's own hydrate-on-mount
   pattern, even though nothing downstream reads these yet (no push
   pipeline exists before M7/M8). The prototype's own version is plain
   in-memory component state that resets the moment ProfileScreen
   remounts — real persistence here is a deliberate improvement, not an
   oversight: PRD names the toggles themselves as in-scope UI, and a
   control that forgets its own state on every remount is a dead one.
   `payments` is always true and can't be toggled — PRD's transactional-
   notifications carve-out — so it's never even written to storage. */
import { useEffect, useState } from "react";
import { getItem, setItem } from "@lib/storage";

const STORAGE_KEY = "youdo.notificationPrefs.v1";

export interface NotificationPrefs {
  offers: boolean;
  messages: boolean;
  reminders: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = { offers: true, messages: true, reminders: true };

export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getItem<NotificationPrefs>(STORAGE_KEY).then((stored) => {
      if (cancelled) return;
      if (stored) setPrefs(stored);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(key: keyof NotificationPrefs) {
    setPrefs((current) => {
      const next = { ...current, [key]: !current[key] };
      setItem(STORAGE_KEY, next);
      return next;
    });
  }

  return { prefs, hydrated, toggle };
}
