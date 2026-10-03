import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider, useRepository } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { usePublicProfile } from "../usePublicProfile";
import { useReportUser } from "../useReportUser";
import { useBlockUser } from "../useBlockUser";
import { useSubmitReview } from "@features/reviews/useSubmitReview";

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

function useHarness(userId: string) {
  const auth = useAuthSession();
  const profile = usePublicProfile(userId);
  const report = useReportUser();
  const block = useBlockUser();
  const submitReview = useSubmitReview();
  const repository = useRepository();
  return { auth, profile, report, block, submitReview, repository };
}

async function renderSignedIn(userId: string) {
  const { result } = await renderHook(() => useHarness(userId), { wrapper: makeWrapper() });
  await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
  await act(() => result.current.auth.signInWithGoogle());
  await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));
  await waitFor(() => expect(result.current.profile.isLoading).toBe(false), { timeout: 3000 });
  return result;
}

describe("usePublicProfile", () => {
  it("resolves the target user's identity and their own open quest (q2, posted by u2)", async () => {
    const result = await renderSignedIn("u2");
    expect(result.current.profile.user?.id).toBe("u2");
    expect(result.current.profile.openQuests.map((q) => q.id)).toContain("q2");
    expect(result.current.profile.openQuests.every((q) => q.status === "open" && q.posterId === "u2")).toBe(true);
  });

  it("shows no visible reviews for u2 by default (nobody has rated u2 back yet)", async () => {
    const result = await renderSignedIn("u2");
    expect(result.current.profile.visibleReviews).toEqual([]);
  });

  it("reveals both sides of a mutual rating pair once the second side submits", async () => {
    // r1 (seeded): u2 rated u0 on q8, invisible until u0 rates back.
    const result = await renderSignedIn("u2");
    await act(async () => {
      await result.current.submitReview.mutateAsync({
        questId: "q8",
        raterId: "u0",
        rateeId: "u2",
        rating: 5,
        comment: "Great to work with.",
      });
    });
    await waitFor(() => expect(result.current.profile.visibleReviews.length).toBeGreaterThan(0), { timeout: 3000 });
    const review = result.current.profile.visibleReviews.find((r) => r.raterId === "u0");
    expect(review?.rateeId).toBe("u2");
    // usePosters' own resolution is a second round of queries fired after
    // visibleReviews arrives — same one-beat-later shape documented at
    // useMyQuests.test.tsx's counterpart assertion.
    await waitFor(() => expect(result.current.profile.raters.get("u0")?.name).toBeTruthy(), { timeout: 3000 });
  });

  it("exposes the viewer's own id", async () => {
    const result = await renderSignedIn("u2");
    expect(result.current.profile.viewerId).toBe("u0");
  });
});

describe("useReportUser", () => {
  it("submits a real report", async () => {
    const result = await renderSignedIn("u2");
    await act(async () => {
      const report = await result.current.report.mutateAsync({
        reporterId: "u0",
        targetUserId: "u2",
        reason: "They didn't turn up",
      });
      expect(report.reporterId).toBe("u0");
      expect(report.targetUserId).toBe("u2");
    });
  });
});

describe("useBlockUser", () => {
  it("blocks a user for real, reflected in listBlockedUserIds", async () => {
    const result = await renderSignedIn("u2");
    await act(async () => {
      await result.current.block.mutateAsync({ userId: "u0", blockedId: "u2" });
    });
    const blocked = await result.current.repository.listBlockedUserIds("u0");
    expect(blocked).toContain("u2");
  });
});
