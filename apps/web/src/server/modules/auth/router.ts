import { env } from '@/env';
import { lucia } from '@/lib/auth';

import { createSessionWithCookies } from '@/lib/auth/utils';
import {
  EMAIL_FROM,
  PASSWORD_RESET_EXPIRES_IN,
  VERIFICATION_CODE_EXPIRES_IN,
  VERIFICATION_CODE_RESEND_DELAY,
} from '@/lib/constants';
import { resend } from '@/lib/resend';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/trpc';
import { getBaseUrl } from '@/utils/getBaseUrl';
import { sleep } from '@/utils/sleep';
import * as EmailTemplates from '@acme/emails';
import { hash, verify } from '@node-rs/argon2';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cookies } from 'next/headers';
import { generateEmailVerificationCode, generatePasswordResetToken } from './shared';
import * as AuthValidators from './validators';

dayjs.extend(relativeTime);

export const authRouter = createTRPCRouter({
  login: publicProcedure.input(AuthValidators.loginSchema).mutation(async ({ ctx, input }) => {
    const { email, password } = input;

    try {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: {
          id: true,
          hashedPassword: true,
        },
      });

      // * Return an error if the user is not found
      if (!existingUser) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // * Check if the password is valid
      const validPassword = await verify(existingUser.hashedPassword as string, password, {
        secret: Buffer.from(env.ARGON_SECRET, 'hex'),
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

      // * Return an error if the password is invalid, without leaking information
      if (!validPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // * Create a new session with cookies
      await createSessionWithCookies(existingUser.id);
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

  signup: publicProcedure.input(AuthValidators.signupSchema).mutation(async ({ ctx, input }) => {
    const { email, password } = input;

    try {
      const existingUser = await ctx.prisma.user.findFirst({
        where: { email: email.toLowerCase().trim() },
        select: {
          id: true,
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Cannot create account with that email',
        });
      }

      // * Generate a hashed password
      const hashedPassword = await hash(password, {
        secret: Buffer.from(env.ARGON_SECRET, 'hex'),
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

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
      // TODO: Move this to a background job with after/waitUntil
      const code = await generateEmailVerificationCode({ userId: user.id });

      await resend.emails.send({
        from: EMAIL_FROM,
        to: [email],
        subject: 'Verify your email address',
        react: EmailTemplates.VerifyEmailWithCode({
          code,
          expiresIn: VERIFICATION_CODE_EXPIRES_IN,
        }),
      });

      await createSessionWithCookies(user.id);
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

  verifyEmail: protectedProcedure
    .input(AuthValidators.verifyEmailSchema)
    .mutation(async ({ ctx, input }) => {
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
            await tx.emailVerificationCode.delete({
              select: { id: true },
              where: { id: item.id },
            });
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
            data: { emailVerified: true },
            select: { id: true },
          }),
        ]);

        await createSessionWithCookies(user.id);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while verifying the code. Please try again.',
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

      // TODO: Move this to a background job with after/waitUntil
      const code = await generateEmailVerificationCode({ userId: user.id });

      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: 'Verify your email address',
        react: EmailTemplates.VerifyEmailWithCode({
          code,
          expiresIn: VERIFICATION_CODE_EXPIRES_IN,
        }),
      });

      await createSessionWithCookies(user.id);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while resending the verification code. Please try again.',
      });
    }

    return { success: true };
  }),

  triggerPasswordReset: publicProcedure
    .input(AuthValidators.triggerPasswordResetSchema)
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
          from: EMAIL_FROM,
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
          message: 'An error occurred while triggering the password reset. Please try again.',
        });
      }
    }),

  resetPassword: publicProcedure
    .input(AuthValidators.resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
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

        // * Return an error if the token is not found
        if (!dbToken) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid password reset link',
          });
        }

        // * Check if the token has expired
        if (dayjs().isAfter(dayjs(dbToken.createdAt).add(PASSWORD_RESET_EXPIRES_IN, 'minute'))) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Password reset link expired.',
          });
        }

        // * Invalidate all user sessions
        await lucia.invalidateUserSessions(dbToken.userId);

        // * Generate a new hashed password
        const hashedPassword = await hash(password, {
          secret: Buffer.from(env.ARGON_SECRET, 'hex'),
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        });

        // * Update the database with the hashed password
        await ctx.prisma.user.update({
          where: { id: dbToken.userId },
          data: {
            emailVerified: true,
            hashedPassword,
          },

          select: { id: true },
        });

        // * Create session with cookies
        await createSessionWithCookies(dbToken.userId);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while resetting your password. Please try again.',
        });
      }
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const { session } = ctx.session;

    // * Invalidate existing session
    await lucia.invalidateSession(session.id);

    // * Create & set a new blank session cookie
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return { success: true };
  }),
});
