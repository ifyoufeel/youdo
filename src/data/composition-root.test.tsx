import React from "react";
import { renderHook } from "@testing-library/react-native";
import { RepositoryProvider, useRepository } from "./composition-root";

describe("composition root", () => {
  const originalFlag = process.env.EXPO_PUBLIC_DATA_ADAPTER;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_ADAPTER = originalFlag;
  });

  it("defaults to the memory adapter", async () => {
    delete process.env.EXPO_PUBLIC_DATA_ADAPTER;
    const { result } = await renderHook(() => useRepository(), {
      wrapper: ({ children }) => <RepositoryProvider>{children}</RepositoryProvider>,
    });
    expect(typeof result.current.getUser).toBe("function");
    // The memory adapter's real slice actually works, not just type-shaped.
    await expect(result.current.getUser("no-such-user")).resolves.toBeNull();
  });

  it("selects the supabase adapter via EXPO_PUBLIC_DATA_ADAPTER", async () => {
    process.env.EXPO_PUBLIC_DATA_ADAPTER = "supabase";
    const { result } = await renderHook(() => useRepository(), {
      wrapper: ({ children }) => <RepositoryProvider>{children}</RepositoryProvider>,
    });
    expect(typeof result.current.getUser).toBe("function");
    // Every Supabase port method is real as of M7 Phase 8 (see
    // adapters/supabase/__tests__ for real request/response coverage
    // against a mocked client) — there's nothing left to reject with
    // NotImplementedYet. What this test can still prove without a real
    // Supabase project is that the *right* adapter got selected: calling
    // through hits client.ts's real "not configured" error (no
    // EXPO_PUBLIC_SUPABASE_URL/ANON_KEY in this test environment), which
    // only the supabase adapter's client can throw — the memory adapter
    // has no such error path at all.
    await expect(result.current.getSession()).rejects.toThrow(/EXPO_PUBLIC_SUPABASE_URL/);
  });

  it("useRepository throws outside a provider", async () => {
    await expect(renderHook(() => useRepository())).rejects.toThrow(/outside <RepositoryProvider>/);
  });
});
