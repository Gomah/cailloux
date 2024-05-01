import { env } from '@/env';
import { type Session as DbSession, type User as DbUser, prisma } from '@acme/db';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { Lucia } from 'lucia';
import { SESSION_EXPIRES_IN, SESSION_NAME } from '../constants';

const adapter = new PrismaAdapter(prisma.session, prisma.user);

interface DatabaseUserAttributes extends Omit<DbUser, 'hashedPassword'> {}
interface DatabaseSessionAttributes
  extends Pick<DbSession, 'ip' | 'browser' | 'os' | 'userAgent'> {}

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
}

export const lucia = new Lucia(adapter, {
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      id: attributes.id,
      email: attributes.email,
      name: attributes.name,
      emailVerified: attributes.emailVerified,
    };
  },

  getSessionAttributes: (attributes) => {
    return {
      ip: attributes.ip,
      browser: attributes.browser,
      os: attributes.os,
      userAgent: attributes.userAgent,
    };
  },

  sessionCookie: {
    name: SESSION_NAME,
    expires: false,
    attributes: {
      secure: env.NODE_ENV === 'production',
    },
  },

  sessionExpiresIn: SESSION_EXPIRES_IN,
});
