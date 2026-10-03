/* Non-route helper (leading underscore — skipped by Expo Router). Wraps
   children in a fresh QueryClient + Repository + AuthSession provider
   stack and signs the session in automatically. Shared by flows.tsx's
   live Browse step — anywhere a specimen needs a real, already-signed-in
   session rather than a static mock, not just one page. */
import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";

function SignInOnMount({ children }: { children: ReactNode }) {
  const { status, signInWithGoogle } = useAuthSession();
  useEffect(() => {
    if (status === "signedOut") signInWithGoogle();
  }, [status, signInWithGoogle]);
  return <>{children}</>;
}

export function AutoSignedIn({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
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
