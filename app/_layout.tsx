/* Composition order: fonts must resolve before anything renders (a
   missing brand font should never flash), react-query sits above the
   repository so query hooks built in M1+ have a client to attach to,
   RepositoryProvider is next since AuthSessionProvider's getSession()
   call needs a repository to call it on, and AuthSessionProvider is
   innermost since it's the one every screen (onboarding's cold-start
   gate, the tab shell, and beyond) actually reads from. ErrorBoundary
   wraps only <Slot/> (M8) — a feature-screen render error shows a real
   retry action; a provider itself failing to initialize is a much rarer
   case with no sensible fallback UI to show before fonts/repository/auth
   exist anyway, so it's left to crash rather than papered over. */
import { useState, useEffect } from "react";
import { Slot } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { FontProvider } from "@design/FontProvider";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider } from "@data/auth-session";
import { createAppQueryClient, persistAppQueryClient } from "@data/query-client";
import { ErrorBoundary } from "@design/components/ErrorBoundary";

export default function RootLayout() {
  const [queryClient] = useState(() => createAppQueryClient());
  useEffect(() => persistAppQueryClient(queryClient), [queryClient]);

  return (
    <FontProvider>
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider>
          <AuthSessionProvider>
            <ErrorBoundary>
              <Slot />
            </ErrorBoundary>
          </AuthSessionProvider>
        </RepositoryProvider>
      </QueryClientProvider>
    </FontProvider>
  );
}
