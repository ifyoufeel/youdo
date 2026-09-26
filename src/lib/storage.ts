/* A thin generic wrapper, not a persistence framework — the whole point
   is a typed getItem/setItem pair over AsyncStorage's string-only API, so
   callers (useBrowseFilters today) never touch JSON.parse/stringify
   directly. AsyncStorage itself is the persistence layer: real native
   storage on iOS/Android, an IndexedDB-backed shim on web (its own
   documented behavior, not something this wrapper works around). */
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getItem<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
