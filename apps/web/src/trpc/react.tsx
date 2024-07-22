'use client';

import type { AppRouter } from '@/server/root';
import { getBaseUrl } from '@/utils/getBaseUrl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type HTTPBatchStreamLinkOptions,
  httpBatchLink,
  loggerLink,
  splitLink,
  unstable_httpBatchStreamLink,
} from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AnyRootTypes } from '@trpc/server/unstable-core-do-not-import';
import { useState } from 'react';
import SuperJSON from 'superjson';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  // biome-ignore lint/suspicious/noAssignInExpressions: safe to ignore
  return (clientQueryClientSingleton ??= createQueryClient());
};

export const api = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() => {
    const opts: HTTPBatchStreamLinkOptions<AnyRootTypes> = {
      transformer: SuperJSON,
      url: `${getBaseUrl()}/api/trpc`,
      headers: () => {
        const headers = new Headers();
        headers.set('x-trpc-source', 'nextjs-react');
        return headers;
      },
    };

    return api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),

        splitLink({
          condition(op) {
            const path = op.path.split('.') as [string, ...string[]];
            const useStreaming = !['auth'].includes(path[0]);
            return useStreaming;
          },

          true: unstable_httpBatchStreamLink(opts),

          // We use `httpBatchLink` for the `auth` module as we need to set cookies.
          // `unstable_httpBatchStreamLink` does not support setting headers once the stream has begun.
          false: httpBatchLink(opts),
        }),
      ],
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}
