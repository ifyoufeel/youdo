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
    // getSession (auth.ts) is still a stub as of M7 Phase 2 — see
    // adapters/supabase/__tests__ for the ports real by now (users,
    // categories, areas), each tested there against a mocked client
    // rather than here, since real methods need real request/response
    // shapes, not just "it rejects".
    await expect(result.current.getSession()).rejects.toThrow(/M7/);
  });

  it("useRepository throws outside a provider", async () => {
    await expect(renderHook(() => useRepository())).rejects.toThrow(/outside <RepositoryProvider>/);
  });
});
