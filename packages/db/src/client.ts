import { PrismaClient } from '@prisma/client';

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

export const prisma =
  global.cachedPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') global.cachedPrisma = prisma;

export * from '@prisma/client';
