import 'server-only';

import { validateRequest } from '@/lib/auth/validateRequest';
import { createCaller } from '@/server/root';
import { createTRPCContext } from '@/server/trpc';
import { headers } from 'next/headers';
import { cache } from 'react';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set('x-trpc-source', 'rsc');

  return createTRPCContext({
    session: await validateRequest(),
    headers: heads,
  });
});

export const api = createCaller(createContext, {
  onError: ({ error, ctx }) => {
    ctx?.log.error(
      { code: error.code, cause: error.cause, stack: error.stack, name: error.name },
      error.message
    );
  },
});
