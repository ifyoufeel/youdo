/* Composition order: fonts must resolve before anything renders (a
   missing brand font should never flash), react-query sits above the
   repository so query hooks built in M1+ have a client to attach to,
   RepositoryProvider is next since AuthSessionProvider's getSession()
   call needs a repository to call it on, and AuthSessionProvider is
   innermost since it's the one every screen (onboarding's cold-start
   gate, the tab shell, and beyond) actually reads from. */
import { useState } from "react";
import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FontProvider } from "@design/FontProvider";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider } from "@data/auth-session";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <FontProvider>
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider>
          <AuthSessionProvider>
            <Slot />
          </AuthSessionProvider>
        </RepositoryProvider>
      </QueryClientProvider>
    </FontProvider>
  );
}
