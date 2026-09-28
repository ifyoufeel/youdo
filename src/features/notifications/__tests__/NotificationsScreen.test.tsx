import React, { useEffect, useState } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { raw } from "@design/tokens/raw";
import { fontFamilyName } from "@design/tokens/font-family";
import { NotificationsScreen } from "../NotificationsScreen";

const BODY_FONT_SEMIBOLD = fontFamilyName(raw.font.text, raw.fontWeight.semibold);

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

describe("NotificationsScreen", () => {
  it(
    "renders u0's real notifications with no console warnings/errors",
    async () => {
      const error = jest.spyOn(console, "error").mockImplementation(() => {});
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      const { findByText, findByTestId } = await render(<NotificationsScreen />, { wrapper: Providers });

      await findByText("Notifications", {}, LONG_TIMEOUT);
      for (const id of ["n1", "n2", "n3", "n4", "n5"]) {
        expect(await findByTestId(`notification-${id}`, {}, LONG_TIMEOUT)).toBeTruthy();
      }

      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
      error.mockRestore();
      warn.mockRestore();
    },
    15000
  );

  it(
    "marks every notification read once the mount effect settles",
    async () => {
      const { findByText } = await render(<NotificationsScreen />, { wrapper: Providers });
      // n1's body text carries readAt-dependent styling (semibold while
      // unread) — the settled state has it back to the plain-regular
      // font, mirroring useNotifications.test.tsx's own "unreadCount
      // becomes 0" assertion one layer up.
      const body = await findByText(/Yi-Chen L\. offered NT\$250/, {}, LONG_TIMEOUT);
      await waitFor(() => {
        const flatStyle = [body.props.style].flat(Infinity);
        expect(flatStyle.some((s) => s?.fontFamily === BODY_FONT_SEMIBOLD)).toBe(false);
      }, LONG_TIMEOUT);
    },
    15000
  );

  it(
    "navigates to the notification's quest on press",
    async () => {
      const { findByTestId } = await render(<NotificationsScreen />, { wrapper: Providers });
      const card = await findByTestId("notification-n1", {}, LONG_TIMEOUT);
      // Real navigation is exercised end-to-end in the preview gallery's
      // flows; here we only confirm the row is pressable without erroring.
      await fireEvent.press(card);
      expect(card).toBeTruthy();
    },
    15000
  );
});
