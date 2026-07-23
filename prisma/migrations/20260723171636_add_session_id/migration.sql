/*
  Warnings:

  - You are about to drop the column `email` on the `verification_token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[session_uuid]` on the table `administrator_session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[session_uuid]` on the table `user_session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token_hash]` on the table `verification_token` will be added. If there are existing duplicate values, this will fail.
  - The required column `session_uuid` was added to the `administrator_session` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `session_uuid` was added to the `user_session` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `userId` to the `verification_token` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "verification_token_email_idx";

-- DropIndex
DROP INDEX "verification_token_email_type_idx";

-- AlterTable
ALTER TABLE "administrator_session" ADD COLUMN     "session_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_session" ADD COLUMN     "session_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "verification_token" DROP COLUMN "email",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "administrator_session_session_uuid_key" ON "administrator_session"("session_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_session_session_uuid_key" ON "user_session"("session_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_token_hash_key" ON "verification_token"("token_hash");

-- CreateIndex
CREATE INDEX "verification_token_userId_idx" ON "verification_token"("userId");

-- CreateIndex
CREATE INDEX "verification_token_userId_type_idx" ON "verification_token"("userId", "type");

-- AddForeignKey
ALTER TABLE "verification_token" ADD CONSTRAINT "verification_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
