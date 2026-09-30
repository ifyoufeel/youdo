/* The one Supabase client every adapters/supabase/*.ts file shares —
   lazily created (never at module import time), so importing this module
   in an environment with no EXPO_PUBLIC_SUPABASE_* vars set (every
   existing jest/typecheck/lint/web:export run today) never throws just
   from being imported — only an actual call reaches the "not configured"
   error below, matching how the M0-M6 stub adapter only throws once a
   method is actually invoked, not on import.

   Session persistence goes through expo-secure-store, not
   src/lib/storage.ts's AsyncStorage wrapper — a session token is a
   credential, not app-preference state, and belongs in the OS keychain/
   keystore. AppState wiring (startAutoRefresh/stopAutoRefresh) matches
   supabase-js's own documented React Native guidance: refreshing an
   auth token while the app is backgrounded just burns battery and can
   race the OS suspending the process mid-request.

   Nothing here has ever been run against a real Supabase project — see
   this repo's M7 scope note (docs/DECISIONS.md's new ADR, Phase 9): the
   shape is carefully matched to supabase-js's documented API, not
   verified against a live instance. */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";

const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

/** Untyped on purpose — see database.types.ts's header comment for why
    the schema generic isn't wired in here. */
function createRealClient(): SupabaseClient {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "The supabase adapter is selected (EXPO_PUBLIC_DATA_ADAPTER=supabase) but " +
        "EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY aren't set — see .env.example. " +
        "No live Supabase project exists yet; this scaffold has never been run against one."
    );
  }
  const client = createClient(url, anonKey, {
    auth: {
      storage: SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  AppState.addEventListener("change", (state) => {
    if (state === "active") client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
  });
  return client;
}

let cached: SupabaseClient | null = null;

/** Every adapters/supabase/*.ts port file calls this instead of importing
    createClient directly — one client, one auth session, shared across
    every table/RPC/realtime-channel call the adapter makes. */
export function supabase(): SupabaseClient {
  if (!cached) cached = createRealClient();
  return cached;
}

/** Test-only: drops the cached client so a test can reset env vars and
    exercise createRealClient()'s "not configured" error again, or swap in
    a fresh mock. Mirrors resetClockForTests/resetIdempotencyForTests'
    own naming in the memory adapter. */
export function resetSupabaseClientForTests(): void {
  cached = null;
}
