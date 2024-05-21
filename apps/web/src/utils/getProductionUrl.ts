import { env } from '@/env';

export const getProductionUrl = (): string => {
  // In the browser we just use a relative URL and everything works perfectly
  // if (typeof window !== 'undefined') return '';
  if (typeof window !== 'undefined') return window.location.origin;

  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;

  if (env.NODE_ENV === 'development') {
    return `http://localhost:${process.env.PORT ?? 3000}`;
  }

  // Finally, fallback to hard-coded URL in case nothing else works
  return 'https://tontongpt.fr';
};
