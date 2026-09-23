import React, { createContext, useContext, useMemo } from "react";
import type { Repository } from "./repository";
import { createMemoryAdapter } from "./adapters/memory";
import { createSupabaseAdapter } from "./adapters/supabase";

/** ADR-008's "repository fault-injection switch" — re-exported from the
    one file ADR-004 permits to import adapters/* directly, so the preview
    rail's dev strip (app/(preview)) can reach it without itself importing
    anything under adapters/. A no-op on the Supabase adapter (nothing to
    inject faults into there yet), which is fine — the switch is preview
    chrome, not part of the Repository contract every adapter must satisfy. */
export { setFaultInjectionRate, getFaultInjectionRate } from "./adapters/memory/fault-injection";

/** Expo only inlines env vars prefixed EXPO_PUBLIC_ into the client bundle
    (its actual convention, not a Node-style process.env read) — this is
    the one flag ADR-004 asks for, defaulting to the memory adapter so
    every existing verify step (typecheck/lint/test/web:export) works with
    zero configuration. */
function selectAdapter(): Repository {
  const flag = process.env.EXPO_PUBLIC_DATA_ADAPTER;
  if (flag === "supabase") {
    return createSupabaseAdapter();
  }
  return createMemoryAdapter();
}

const RepositoryContext = createContext<Repository | null>(null);

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const repository = useMemo(() => selectAdapter(), []);
  return <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>;
}

export function useRepository(): Repository {
  const repository = useContext(RepositoryContext);
  if (!repository) {
    throw new Error("useRepository() called outside <RepositoryProvider>");
  }
  return repository;
}
