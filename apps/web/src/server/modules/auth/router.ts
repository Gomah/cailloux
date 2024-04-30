import { env } from '@/env';
import { lucia } from '@/lib/auth';

import { createSession } from '@/lib/auth/utils';
import {
  PASSWORD_RESET_EXPIRES_IN,
  VERIFICATION_CODE_EXPIRES_IN,
  VERIFICATION_CODE_RESEND_DELAY,
} from '@/lib/constants';
import { resend } from '@/lib/resend';
import { getBaseUrl } from '@/utils/getBaseUrl';
import { sleep } from '@/utils/sleep';
import * as EmailTemplates from '@acme/emails';
import { hash, verify } from '@node-rs/argon2';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cookies } from 'next/headers';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../../trpc';
import { generateEmailVerificationCode, generatePasswordResetToken } from './shared';
import {
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  triggerPasswordResetSchema,
  verifyEmailSchema,
} from './validators';

dayjs.extend(relativeTime);

export const authRouter = createTRPCRouter({
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const { email, password } = input;

    try {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: {
          id: true,
          hashedPassword: true,
        },
      });

      if (!existingUser) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      const validPassword = await verify(existingUser.hashedPassword as string, password, {
        secret: Buffer.from(env.ARGON_SECRET, 'hex'),
      });

      if (!validPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      const session = await createSession(existingUser.id);
      const sessionCookie = lucia.createSessionCookie(session.id);

      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while logging in. Please try again.',
      });
    }

    return { success: true };
  }),

  signup: publicProcedure.input(signupSchema).mutation(async ({ ctx, input }) => {
    const { email, password } = input;

    const hashedPassword = await hash(password, {
      secret: Buffer.from(env.ARGON_SECRET, 'hex'),
    });

    try {
      const existingUser = await ctx.prisma.user.findFirst({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Cannot create account with that email',
        });
      }

      const user = await ctx.prisma.user.create({
        data: {
          email,
          hashedPassword,
        },
        select: {
          id: true,
        },
      });

      // * Generate the code
      const code = await generateEmailVerificationCode({ userId: user.id });

      await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [email],
        subject: 'Verify your email address',
        react: EmailTemplates.VerifyEmailWithCode({
          code,
          expiresIn: VERIFICATION_CODE_EXPIRES_IN,
        }),
      });

      const session = await createSession(user.id);

      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while signing up. Please try again.',
      });
    }

    return { success: true };
  }),

  verifyEmail: protectedProcedure.input(verifyEmailSchema).mutation(async ({ ctx, input }) => {
    const { code } = input;
    const { user } = ctx.session;

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid session',
      });
    }

    try {
      const dbCode = await ctx.prisma.$transaction(async (tx) => {
        // * Get the verification code
        const item = await tx.emailVerificationCode.findFirst({
          where: {
            userId: user.id,
          },
          select: {
            id: true,
            createdAt: true,
            code: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        });

        if (item) {
          await tx.emailVerificationCode.delete({ where: { id: item.id } });
        }

        return item;
      });

      if (!dbCode || dbCode.code !== code) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid verification code',
        });
      }

      if (dayjs().isAfter(dayjs(dbCode.createdAt).add(VERIFICATION_CODE_EXPIRES_IN, 'minute'))) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Verification code expired',
        });
      }

      if (dbCode.user.email !== user.email) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Email does not match',
        });
      }

      await Promise.all([
        await lucia.invalidateUserSessions(user.id),
        await ctx.prisma.user.update({
          where: { id: user.id },
          data: { email_verified: true },
          select: { id: true },
        }),
      ]);

      const session = await createSession(user.id);
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while logging in. Please try again.',
      });
    }
  }),

  resendVerificationEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx.session;

    try {
      const lastSent = await ctx.prisma.emailVerificationCode.findFirst({
        where: {
          userId: user.id,
        },
        select: {
          createdAt: true,
        },
      });

      if (
        lastSent &&
        dayjs().isBefore(dayjs(lastSent.createdAt).add(VERIFICATION_CODE_RESEND_DELAY, 'minute'))
      ) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Please wait ${dayjs(lastSent.createdAt)
            .add(VERIFICATION_CODE_RESEND_DELAY, 'minute')
            .toNow(true)} before requesting a new verification code`,
        });
      }

      const code = await generateEmailVerificationCode({ userId: user.id });

      await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: user.email,
        subject: 'Verify your email address',
        react: EmailTemplates.VerifyEmailWithCode({
          code,
          expiresIn: VERIFICATION_CODE_EXPIRES_IN,
        }),
      });

      const session = await createSession(user.id);

      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while logging in. Please try again.',
      });
    }

    return { success: true };
  }),

  triggerPasswordReset: publicProcedure
    .input(triggerPasswordResetSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      try {
        const user = await ctx.prisma.user.findFirst({
          where: { email: email.toLowerCase().trim() },
        });

        // * We just return success here with a small delay, so we don't leak emails
        if (!user) {
          sleep(Math.random() * (1000 - 300) + 300);
          return { success: true };
        }

        // Generate verification token
        const verificationToken = await generatePasswordResetToken({ userId: user.id });

        // Create Verification Link
        const verificationLink = `${getBaseUrl()}/auth/reset-password/${verificationToken}`;

        // Send the reset password email
        await resend.emails.send({
          from: 'Acme <onboarding@resend.dev>',
          to: [email],
          subject: 'Reset your password',
          react: EmailTemplates.ResetPassword({
            action_url: verificationLink,
            expiresIn: PASSWORD_RESET_EXPIRES_IN,
          }),
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send verification email. Please try again.',
        });
      }
    }),

  resetPassword: publicProcedure.input(resetPasswordSchema).mutation(async ({ ctx, input }) => {
    try {
      const { token, password } = input;

      const dbToken = await ctx.prisma.$transaction(async (tx) => {
        // Get the token in the database
        const item = await tx.passwordResetToken.findFirst({
          where: { token },
          select: {
            id: true,
            createdAt: true,
            userId: true,
          },
        });

        // Delete the token
        if (item) {
          await tx.passwordResetToken.delete({ where: { id: item.id } });
        }

        return item;
      });

      if (!dbToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid password reset link',
        });
      }

      if (dayjs().isAfter(dayjs(dbToken.createdAt).add(PASSWORD_RESET_EXPIRES_IN, 'minute'))) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Password reset link expired.',
        });
      }

      await lucia.invalidateUserSessions(dbToken.userId);

      const hashedPassword = await hash(password, {
        secret: Buffer.from(env.ARGON_SECRET, 'hex'),
      });

      // * Update the database with the hashed password
      await ctx.prisma.user.update({
        where: { id: dbToken.userId },
        data: {
          email_verified: true,
          hashedPassword,
        },

        select: { id: true },
      });

      const session = await createSession(dbToken.userId);
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while logging in. Please try again.',
      });
    }
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const { session } = ctx.session;

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return { success: true };
  }),
});
