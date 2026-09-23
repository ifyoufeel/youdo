/* Composition order: fonts must resolve before anything renders (a
   missing brand font should never flash), react-query sits above the
   repository so query hooks built in M1+ have a client to attach to, and
   RepositoryProvider is the innermost provider since it's the one every
   screen actually reads from. */
import { useState } from "react";
import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FontProvider } from "@design/FontProvider";
import { RepositoryProvider } from "@data/composition-root";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <FontProvider>
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider>
          <Slot />
        </RepositoryProvider>
      </QueryClientProvider>
    </FontProvider>
  );
}
