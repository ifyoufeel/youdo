import React, { useEffect, useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { ThreadScreen } from "../ThreadScreen";

const LONG_TIMEOUT = { timeout: 5000 };

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

describe("ThreadScreen", () => {
  it("renders t-q1-u0's real messages with no console warnings/errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { findByText } = await render(<ThreadScreen threadId="t-q1-u0" />, { wrapper: Providers });

    expect(await findByText("Buzzer is 14B, see you at six", {}, LONG_TIMEOUT)).toBeTruthy();

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  it("shows the address reveal card once the accepted doer's quest has left open", async () => {
    // q1: u0 the accepted doer, in_progress (not open) — address shown.
    const { findByText } = await render(<ThreadScreen threadId="t-q1-u0" />, { wrapper: Providers });
    expect(await findByText("Exact address", {}, LONG_TIMEOUT)).toBeTruthy();
    expect(await findByText("14B, Lane 31, Yongkang St", {}, LONG_TIMEOUT)).toBeTruthy();
  });

  it(
    "shows a closed-thread banner instead of a composer once the quest is closed",
    async () => {
      // t-q8-u0's quest (q8) is seeded "paid".
      const { findByText, queryByTestId } = await render(<ThreadScreen threadId="t-q8-u0" />, { wrapper: Providers });
      expect(await findByText(/read-only/, {}, LONG_TIMEOUT)).toBeTruthy();
      expect(queryByTestId("thread-composer")).toBeNull();
    },
    15000
  );

  it(
    "sending a message clears the draft and the message appears in the list",
    async () => {
      const { findByTestId, findByText } = await render(<ThreadScreen threadId="t-q6-u2" />, { wrapper: Providers });
      const composer = await findByTestId("thread-composer", {}, LONG_TIMEOUT);

      await fireEvent.changeText(composer, "Sounds good, see you then.");
      await fireEvent.press(await findByTestId("thread-send", {}, LONG_TIMEOUT));

      expect(await findByText("Sounds good, see you then.", {}, LONG_TIMEOUT)).toBeTruthy();
      expect(composer.props.value).toBe("");
    },
    15000
  );

  it(
    "disables the send button until the draft is non-empty",
    async () => {
      const { findByTestId } = await render(<ThreadScreen threadId="t-q6-u3" />, { wrapper: Providers });
      const send = await findByTestId("thread-send", {}, LONG_TIMEOUT);
      expect(send.props.accessibilityState.disabled).toBe(true);

      const composer = await findByTestId("thread-composer", {}, LONG_TIMEOUT);
      await fireEvent.changeText(composer, "Hi");
      expect(await findByTestId("thread-send", {}, LONG_TIMEOUT)).toHaveProperty("props.accessibilityState.disabled", false);
    },
    15000
  );
});
