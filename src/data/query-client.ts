/* M8's offline slice. Two real pieces, both built on top of what
   @tanstack/react-query already ships rather than a bespoke queue:

   1. `networkMode: "offlineFirst"` on both queries and mutations, paired
      with wiring react-query's own `onlineManager` to a real connectivity
      signal (@react-native-community/netinfo) instead of its web-only
      default (`navigator.onLine`, which is `undefined` in React Native and
      would otherwise leave the library guessing). With this wired, a
      mutation fired while offline doesn't error — it goes `isPaused` and
      fires for real the moment `onlineManager` reports back online. That
      *is* offline mutation queueing; no separate queue/list to maintain.
   2. The query cache itself persisted to AsyncStorage
      (`@tanstack/react-query-persist-client` +
      `@tanstack/query-async-storage-persister`), so a cold start while
      offline still has yesterday's browse feed/profile/thread data to
      show instead of a blank loading state.

   Ledger data (`["ledger", ...]` — balances, entries, pending payments)
   is deliberately excluded from persistence: AsyncStorage is unencrypted
   device storage, and there's no real reason a wallet balance needs to
   outlive an app restart on disk when a fresh fetch is one request away
   the moment the app is back online. Everything else (quests, offers,
   threads, reviews, users, categories, areas, saved-quest ids) persists,
   since browsing stale-but-present data offline is exactly the point. */
import { QueryClient, onlineManager, type Query } from "@tanstack/react-query";
import { persistQueryClient, type PersistedClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const PERSIST_KEY = "youdo.queryCache.v1";
const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000;

let onlineManagerWired = false;

/** Idempotent — safe to call from every RepositoryProvider mount (tests
    included) without accumulating duplicate NetInfo listeners. */
function wireOnlineManager(): void {
  if (onlineManagerWired) return;
  onlineManagerWired = true;
  onlineManager.setEventListener((setOnline) => NetInfo.addEventListener((state) => setOnline(!!state.isConnected)));
}

export function createAppQueryClient(): QueryClient {
  wireOnlineManager();
  return new QueryClient({
    defaultOptions: {
      queries: { networkMode: "offlineFirst", retry: 2 },
      mutations: { networkMode: "offlineFirst", retry: 2 },
    },
  });
}

function shouldPersistQuery(query: Query): boolean {
  return query.queryKey[0] !== "ledger";
}

/** Fire-and-forget — `persistQueryClient` restores from disk
    asynchronously and keeps writing in the background for the life of
    the client; nothing here needs to be awaited before the app renders,
    the same "cached data first, fresh data once it lands" posture
    `networkMode: "offlineFirst"` already takes for individual queries. */
export function persistAppQueryClient(queryClient: QueryClient): void {
  const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: PERSIST_KEY });
  void persistQueryClient({
    queryClient,
    persister,
    maxAge: MAX_CACHE_AGE_MS,
    dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
  });
}

export type { PersistedClient };
