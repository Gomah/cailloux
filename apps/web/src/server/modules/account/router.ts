import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { prisma } from '@acme/db';
import { updateProfileSchema } from './validators';

export const accountRouter = createTRPCRouter({
  sessions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.session.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  profile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await prisma.user.findUnique({
      where: {
        email: ctx.session.user.email,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return profile;
  }),

  updateProfile: protectedProcedure.input(updateProfileSchema).mutation(async ({ ctx, input }) => {
    const updatedProfile = await ctx.prisma.user.update({
      where: {
        email: ctx.session.user.email,
      },
      data: {
        name: input.name,
      },
      select: {
        name: true,
      },
    });

    return updatedProfile;
  }),
});
