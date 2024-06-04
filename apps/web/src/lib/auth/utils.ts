import type { RegisteredDatabaseSessionAttributes, UserId } from 'lucia';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { userAgent } from 'next/server';
import { lucia } from '.';
import { validateRequest } from './validateRequest';

export const getUserSession = async () => {
  const { session, user } = await validateRequest();

  if (!user || !session) redirect('/auth/login');
  if (!user.emailVerified) redirect('/auth/verify-email');

  return { user, session };
};

export const createSessionWithCookies = async (
  userId: UserId,
  attributes?: RegisteredDatabaseSessionAttributes,
  options?: {
    sessionId?: string;
  }
) => {
  const { browser, ua, os } = userAgent({
    headers: headers(),
  });

  const session = await lucia.createSession(
    userId,
    {
      ip: headers().get('x-forwarded-for'),
      // @ts-ignore
      browser: `${browser.name} ${browser.major}`,
      os: `${os.name} ${os.version}`,
      userAgent: ua,
      ...attributes,
    },
    options
  );
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
};
