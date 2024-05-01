/*
  Warnings:

  - You are about to drop the column `email_verified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "email_verified",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;
