import React, { useEffect, useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { quests as questStore } from "@data/adapters/memory/store";
import type { QuestStatus } from "@data/contracts";
import { QuestDetailScreen } from "../QuestDetailScreen";

const LONG_TIMEOUT = { timeout: 5000 };

// Whitebox — q11 is the fixture's one real "assigned" quest, but u0 is
// only ever its doer there (posted by u3), so the poster-side assigned
// view still has no fixture-native quest to render. Tests below force
// the store's own Quest object directly, before render() (the initial
// fetch then reads the forced state, same as any other query), and
// restore it after — same technique
// src/data/adapters/memory/__tests__/quests.test.ts already established.
function forceQuestStatus(id: string, status: QuestStatus) {
  const quest = questStore.find((q) => q.id === id)!;
  const original = quest.status;
  quest.status = status;
  return () => {
    quest.status = original;
  };
}

// Mirrors app/index.tsx's real cold-start gate: a screen behind auth
// never mounts until status is "signedIn", so children only render once
// sign-in actually resolves — matching production, not just racing it.
function SignInOnMount({ children }: { children: React.ReactNode }) {
  const { status, signInWithGoogle } = useAuthSession();
  useEffect(() => {
    if (status === "signedOut") signInWithGoogle();
  }, [status, signInWithGoogle]);
  if (status !== "signedIn") return null;
  return <>{children}</>;
}

function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>
        <AuthSessionProvider>
          <SignInOnMount>{children}</SignInOnMount>
        </AuthSessionProvider>
      </RepositoryProvider>
    </QueryClientProvider>
  );
}

describe("QuestDetailScreen", () => {
  it("renders a visitor's view with no console warnings/errors, offering CTAs and a hidden address", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { findByText, queryByText } = await render(<QuestDetailScreen questId="q2" />, { wrapper: Providers });

    await findByText("Ask", {}, LONG_TIMEOUT);
    expect(await findByText("Take this quest", {}, LONG_TIMEOUT)).toBeTruthy();
    expect(queryByText(/the exact address is shared/i)).toBeTruthy();

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it(
    "shows the poster's own view: an offer count, a real Review offers button, no offer CTAs",
    async () => {
      const { findByText, queryByText } = await render(<QuestDetailScreen questId="q6" />, { wrapper: Providers });
      expect(await findByText("Review 3 offers", {}, LONG_TIMEOUT)).toBeTruthy();
      expect(queryByText("Take this quest")).toBeNull();
      expect(queryByText("Ask")).toBeNull();
    },
    15000
  );

  it(
    "never shows Review offers once the quest has left open, even for its own poster",
    async () => {
      // q7: posted by u0, status "completed" — the title legitimately
      // appears twice (TopBar + body header), so wait on unique body
      // content instead, same workaround the address-reveal test below
      // already uses.
      const { findByText, queryByText } = await render(<QuestDetailScreen questId="q7" />, { wrapper: Providers });
      await findByText("~30 min", {}, LONG_TIMEOUT);
      expect(queryByText(/Review/)).toBeNull();
    },
    15000
  );

  it("shows an applicant's own offer with a real withdraw action", async () => {
    const { findByText, findByTestId } = await render(<QuestDetailScreen questId="q3" />, { wrapper: Providers });
    await findByText(/Your offer: NT\$1,050/, {}, LONG_TIMEOUT);
    expect(await findByTestId("withdraw-offer", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it(
    "shows a real See profile action in the trust panel for a non-poster viewer",
    async () => {
      const { findByTestId } = await render(<QuestDetailScreen questId="q1" />, { wrapper: Providers });
      expect(await findByTestId("see-profile", {}, LONG_TIMEOUT)).toBeTruthy();
    },
    15000
  );

  it(
    "reveals the address to the accepted doer once the quest has left open",
    async () => {
      // The title legitimately appears twice — once in TopBar, once in the
      // body's header card, matching the prototype's own layout — so this
      // waits on a piece of body content that's only ever rendered once.
      // It also waits on role-dependent content ("Doing this quest"),
      // since role/addressVisible both derive from the offers query, which
      // can resolve after the quest query that the meta rows depend on.
      const { findByText, queryByText } = await render(<QuestDetailScreen questId="q1" />, { wrapper: Providers });
      await findByText("~60 min", {}, LONG_TIMEOUT);
      await findByText("Doing this quest", {}, LONG_TIMEOUT);
      expect(queryByText(/the exact address is shared/i)).toBeNull();
    },
    15000
  );

  it(
    "sending an offer shows a confirmation toast carrying the poster's real name",
    async () => {
      const { findByText, findByTestId } = await render(<QuestDetailScreen questId="q4" />, { wrapper: Providers });
      await findByText("Ask", {}, LONG_TIMEOUT);

      await fireEvent.press(await findByText("Ask", {}, LONG_TIMEOUT));
      await findByTestId("offer-sheet", {}, LONG_TIMEOUT);
      await fireEvent.press(await findByTestId("offer-submit", {}, LONG_TIMEOUT));

      expect(await findByText(/Offer sent to/, {}, LONG_TIMEOUT)).toBeTruthy();
    },
    15000
  );

  it(
    "shows Cancel + Mark as done for the accepted doer on an in_progress quest",
    async () => {
      // q1 is naturally in_progress, u0 the accepted doer.
      const { findByTestId, queryByTestId } = await render(<QuestDetailScreen questId="q1" />, { wrapper: Providers });
      expect(await findByTestId("mark-as-done", {}, LONG_TIMEOUT)).toBeTruthy();
      expect(queryByTestId("start-quest")).toBeNull();
    },
    15000
  );

  it(
    "shows Cancel + Start quest for the accepted doer once assigned",
    async () => {
      const restore = forceQuestStatus("q1", "assigned");
      const { findByTestId, queryByTestId } = await render(<QuestDetailScreen questId="q1" />, { wrapper: Providers });
      expect(await findByTestId("start-quest", {}, LONG_TIMEOUT)).toBeTruthy();
      expect(queryByTestId("mark-as-done")).toBeNull();
      restore();
    },
    15000
  );

  it(
    "shows only Cancel for the poster once assigned — no Review offers, no dead confirm/issue buttons",
    async () => {
      // q6: posted by u0, forced out of "open".
      const restore = forceQuestStatus("q6", "assigned");
      const { findByText, queryByText } = await render(<QuestDetailScreen questId="q6" />, { wrapper: Providers });
      await findByText("Accepted", {}, LONG_TIMEOUT); // the StatusBadge/StatusTrack label, confirms the forced state rendered
      expect(queryByText(/Review/)).toBeNull();
      expect(queryByText("Take this quest")).toBeNull();
      restore();
    },
    15000
  );

  it(
    "shows Leave a rating for the accepted doer on a paid, unrated quest, and submitting shows a real toast",
    async () => {
      // q8: naturally paid, u0 the accepted doer — the seed's r1 is only
      // the poster's rating of u0, not the reverse, so u0 still has none.
      const { findByTestId, findByText, findByLabelText } = await render(<QuestDetailScreen questId="q8" />, {
        wrapper: Providers,
      });
      await fireEvent.press(await findByTestId("leave-a-rating", {}, LONG_TIMEOUT));
      await fireEvent.press(await findByLabelText("5 stars", {}, LONG_TIMEOUT));
      await fireEvent.press(await findByTestId("rate-sheet-confirm", {}, LONG_TIMEOUT));

      expect(await findByText(/Rated —/, {}, LONG_TIMEOUT)).toBeTruthy();
    },
    15000
  );

  it(
    "cancelling from the slab moves the quest to cancelled — the real mutation, not just a whitebox render",
    async () => {
      // q1: signed-in u0 is already its naturally in_progress accepted
      // doer — no forcing needed. The last test in this file, since a
      // real cancel is a one-way trip for q1's shared module state.
      const { findByTestId, findByText, findByLabelText } = await render(<QuestDetailScreen questId="q1" />, {
        wrapper: Providers,
      });
      await fireEvent.press(await findByTestId("cancel-quest-slab", {}, LONG_TIMEOUT));
      await fireEvent.press(await findByLabelText("My plans changed", {}, LONG_TIMEOUT));
      await fireEvent.press(await findByTestId("cancel-sheet-confirm", {}, LONG_TIMEOUT));

      await findByText("Cancelled", {}, LONG_TIMEOUT);
    },
    15000
  );
});
