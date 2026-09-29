import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { RepositoryProvider, useRepository } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useMyQuests } from "../useMyQuests";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </RepositoryProvider>
      </QueryClientProvider>
    );
  };
}

function useHarness() {
  const auth = useAuthSession();
  const myQuests = useMyQuests();
  const repository = useRepository();
  const queryClient = useQueryClient();
  return { auth, myQuests, repository, queryClient };
}

async function renderSignedIn() {
  const { result } = await renderHook(() => useHarness(), { wrapper: makeWrapper() });
  await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
  await act(() => result.current.auth.signInWithGoogle());
  await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));
  await waitFor(() => expect(result.current.myQuests.isLoading).toBe(false), { timeout: 3000 });
  return result;
}

describe("useMyQuests", () => {
  it("buckets u0's real fixture engagements correctly: active/offers/done", async () => {
    const result = await renderSignedIn();
    const ids = (bucket: "active" | "offers" | "done") =>
      result.current.myQuests.buckets[bucket].map((e) => e.quest.id).sort();

    // q1: accepted offer (doer), in_progress -> active
    // q6/q7: posted by u0, open/completed -> active
    // q11: accepted offer (doer), assigned -> active
    // q8: accepted offer, paid but u0 (doer) hasn't rated u2 back yet ->
    // stays active per bucketOf's restored M6 carve-out
    expect(ids("active")).toEqual(["q1", "q11", "q6", "q7", "q8"]);
    // q3: u0's own pending offer (applicant) -> offers
    expect(ids("offers")).toEqual(["q3"]);
    // q9: accepted offer, cancelled (never reaches "paid", so the review
    // carve-out never applies) -> done
    expect(ids("done")).toEqual(["q9"]);
  });

  it("moves a paid quest from active to done once the viewer submits their own rating", async () => {
    const result = await renderSignedIn();
    expect(result.current.myQuests.buckets.active.map((e) => e.quest.id)).toContain("q8");

    await act(async () => {
      await result.current.repository.submitReview("q8", "u0", "u2", 5, "Thanks!", {
        idempotencyKey: "test-carve-out",
      });
    });
    await act(async () => {
      await result.current.queryClient.invalidateQueries({ queryKey: ["reviews"] });
      await result.current.myQuests.refetch();
    });
    await waitFor(() => expect(result.current.myQuests.buckets.done.map((e) => e.quest.id)).toContain("q8"));
    expect(result.current.myQuests.buckets.active.map((e) => e.quest.id)).not.toContain("q8");
  });

  it("derives the poster role and 'Posted by you' shape for u0's own quest", async () => {
    const result = await renderSignedIn();
    const q6 = result.current.myQuests.buckets.active.find((e) => e.quest.id === "q6");
    expect(q6?.role).toBe("poster");
    expect(q6?.amountMinor).toBe(q6?.quest.payoutMinor);
    expect(q6?.counterpart).toBeNull();
  });

  it("derives the doer role and the accepted amount for an in-progress quest", async () => {
    const result = await renderSignedIn();
    const q1 = () => result.current.myQuests.buckets.active.find((e) => e.quest.id === "q1");
    expect(q1()?.role).toBe("doer");
    expect(q1()?.amountMinor).toBe(40000); // o1's accepted amount, not q1's asking price
    // Counterpart resolution (usePosters) is a separate round of queries
    // fired after the quest/offer data it depends on — waits one more
    // beat past the base isLoading gate, same as BrowseScreen's own
    // poster-info-arrives-a-beat-later shape.
    await waitFor(() => expect(q1()?.counterpart?.name).toBeTruthy(), { timeout: 3000 });
  });

  it("derives the applicant role and the pending offer amount", async () => {
    const result = await renderSignedIn();
    const q3 = result.current.myQuests.buckets.offers.find((e) => e.quest.id === "q3");
    expect(q3?.role).toBe("applicant");
    expect(q3?.amountMinor).toBe(105000); // o3's pending amount
  });

  it("never includes a quest the user is a pure visitor on", async () => {
    const result = await renderSignedIn();
    const allIds = [
      ...result.current.myQuests.buckets.active,
      ...result.current.myQuests.buckets.offers,
      ...result.current.myQuests.buckets.done,
    ].map((e) => e.quest.id);
    expect(allIds).not.toContain("q2");
    expect(allIds).not.toContain("q4");
    expect(allIds).not.toContain("q5");
    expect(allIds).not.toContain("q10");
  });
});
