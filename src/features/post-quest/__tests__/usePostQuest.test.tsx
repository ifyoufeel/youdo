import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { usePostQuest } from "../usePostQuest";
import type { PostQuestInput } from "@data/ports/quests";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider>{children}</RepositoryProvider>
      </QueryClientProvider>
    );
  };
}

const INPUT: PostQuestInput = {
  posterId: "u0",
  title: "Assemble a bookshelf",
  details: "Flat-pack, instructions included.",
  categoryId: "assembly",
  payoutMinor: 60000,
  estimatedMinutes: 90,
  durationLabel: null,
  addressLine: "14B, Lane 31, Yongkang St",
  area: "Da'an",
  point: { x: 1920, y: -2260 },
  scheduledFor: "2026-09-20T14:00:00+08:00",
  expiresAt: "2026-09-20T13:00:00+08:00",
  requirements: [],
};

describe("usePostQuest", () => {
  it("posts a real quest via the repository", async () => {
    const { result } = await renderHook(() => usePostQuest(), { wrapper: makeWrapper() });
    let posted;
    await act(async () => {
      posted = await result.current.mutateAsync(INPUT);
    });
    expect(posted).toMatchObject({ status: "open", title: "Assemble a bookshelf" });
  });

  it("invalidates the quests query cache on success", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <RepositoryProvider>{children}</RepositoryProvider>
        </QueryClientProvider>
      );
    }
    const { result } = await renderHook(() => usePostQuest(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync(INPUT);
    });
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["quests"] }));
  });
});
