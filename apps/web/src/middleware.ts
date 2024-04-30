import { verifyRequestOrigin } from 'lucia';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.method === 'GET') {
    return NextResponse.next();
  }

  // * CSRF – Check if the request origin is allowed
  // @note CSRF https://lucia-auth.com/guides/validate-session-cookies/nextjs-app
  const originHeader = request.headers.get('Origin');
  const hostHeader = request.headers.get('X-Forwarded-Host');
  if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
    return new NextResponse(null, {
      status: 403,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|sitemap.xml|robots.txt).*)'],
};
