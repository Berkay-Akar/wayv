"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@/utils/trpc";
import { httpLink } from "@trpc/client";
import superjson from "superjson";
import { useState, type ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
      transformer: superjson,
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}


