import React, { createContext, useContext, useMemo } from "react";
import type { Repository } from "./repository";
import { createMemoryAdapter } from "./adapters/memory";
import { createSupabaseAdapter } from "./adapters/supabase";

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
