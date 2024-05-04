import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { validateRequest } from '@/lib/auth/validateRequest';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/trpc';

// export const runtime = 'edge';

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
const setCorsHeaders = (res: Response) => {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Request-Method', '*');
  res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.headers.set('Access-Control-Allow-Headers', '*');
};

export const OPTIONS = () => {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
};

const handler = async (req: Request) => {
  const session = await validateRequest();
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    createContext: () =>
      createTRPCContext({
        session,
        headers: req.headers,
      }),
    onError({ error, ctx }) {
      ctx?.log.error(
        { code: error.code, cause: error.cause, stack: error.stack, name: error.name },
        error.message
      );
    },
  });

  setCorsHeaders(response);
  return response;
};

export { handler as GET, handler as POST };
