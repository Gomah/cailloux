/**
 * Consistently determine the API URL for the current client even when in a deploy preview or similar
 */
export const getBaseUrl = (): string => {
  // In the browser we just use a relative URL and everything works perfectly
  // if (typeof window !== 'undefined') return '';
  if (typeof window !== 'undefined') return window.location.origin;

  // Infer the deploy URL if we're in production
  const PROVIDER_URL = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;

  if (PROVIDER_URL) {
    // We replace https:// from the URL if it exists and add it ourselves always at the beginning as the above environment variables are not guaranteed to include it
    return `https://${PROVIDER_URL.replace(/^https?:\/\//, '')}`;
  }

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_APPLICATION_ENVIRONMENT === 'CI'
  ) {
    return `http://localhost:${process.env.PORT ?? 3000}`;
  }

  // Finally, fallback to hard-coded URL in case nothing else works
  return 'https://cailloux-web.vercel.app';
};
