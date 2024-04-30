import type { RegisteredDatabaseSessionAttributes, UserId } from 'lucia';
import { headers } from 'next/headers';
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

export const createSession = (
  userId: UserId,
  attributes?: RegisteredDatabaseSessionAttributes,
  options?: {
    sessionId?: string;
  }
) => {
  const { browser, ua, device, engine, os } = userAgent({
    headers: headers(),
  });

  return lucia.createSession(
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
};
