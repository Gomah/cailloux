import { prisma } from '@acme/db';
import { generateIdFromEntropySize } from 'lucia';
import { alphabet, generateRandomString } from 'oslo/crypto';

export async function generatePasswordResetToken({ userId }: { userId: string }): Promise<string> {
  // Delete all previous tokens associated with this user
  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  // Create token
  const tokenId = generateIdFromEntropySize(25); // 40 characters

  // Save the password token in the db
  await prisma.passwordResetToken.create({
    data: {
      token: tokenId,
      userId,
    },
    select: {
      id: true,
    },
  });

  return tokenId;
}

export async function generateEmailVerificationCode({
  userId,
}: { userId: string }): Promise<string> {
  // Delete all previous codes associated with this user
  await prisma.emailVerificationCode.deleteMany({ where: { userId } });

  // Create code
  const code = generateRandomString(6, alphabet('0-9'));

  // Save the code in the db
  await prisma.emailVerificationCode.create({
    data: {
      userId,
      code,
    },
    select: { id: true },
  });

  return code;
}
