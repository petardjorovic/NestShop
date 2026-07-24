/*
  Warnings:

  - Added the required column `csrf_token_hash` to the `administrator_session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `csrf_token_hash` to the `user_session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "administrator_session" ADD COLUMN     "csrf_token_hash" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "user_session" ADD COLUMN     "csrf_token_hash" VARCHAR(255) NOT NULL;
