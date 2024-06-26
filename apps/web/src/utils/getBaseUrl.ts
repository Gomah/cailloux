import { env } from '@/env';

/**
 * Consistently determine the API URL for the current client even when in a deploy preview or similar
 */
export const getBaseUrl = (): string => {
  // In the browser we just use a relative URL and everything works perfectly
  if (typeof window !== 'undefined') return window.location.origin;

  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;

  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:${process.env.PORT ?? 3000}`;
  }

  // Finally, fallback to hard-coded URL in case nothing else works
  return 'https://cailloux-web.vercel.app';
};
