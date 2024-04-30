import { lucia } from '@/lib/auth';
import { PASSWORD_RESET_EXPIRES_IN, VERIFICATION_CODE_EXPIRES_IN } from '@/lib/constants';
import { prisma } from '@acme/db';
import dayjs from 'dayjs';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  await Promise.allSettled([
    // * Delete expired sessions
    lucia.deleteExpiredSessions(),

    // * Delete expired password tokens
    prisma.passwordResetToken.deleteMany({
      where: {
        createdAt: {
          lt: dayjs().subtract(PASSWORD_RESET_EXPIRES_IN, 'minutes').toISOString(),
        },
      },
    }),

    // * Delete expired verification codes
    prisma.emailVerificationCode.deleteMany({
      where: {
        createdAt: {
          lt: dayjs().subtract(VERIFICATION_CODE_EXPIRES_IN, 'minutes').toISOString(),
        },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
