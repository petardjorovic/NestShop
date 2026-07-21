-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "administrator" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "password_hash" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "password_hash" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "user_session" (
    "user_session_id" SERIAL NOT NULL,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("user_session_id")
);

-- CreateTable
CREATE TABLE "verification_token" (
    "verification_token_id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "type" "VerificationType" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_token_pkey" PRIMARY KEY ("verification_token_id")
);

-- CreateIndex
CREATE INDEX "user_session_user_id_idx" ON "user_session"("user_id");

-- CreateIndex
CREATE INDEX "user_session_expires_at_idx" ON "user_session"("expires_at");

-- CreateIndex
CREATE INDEX "user_session_user_id_revoked_at_idx" ON "user_session"("user_id", "revoked_at");

-- CreateIndex
CREATE INDEX "verification_token_email_idx" ON "verification_token"("email");

-- CreateIndex
CREATE INDEX "verification_token_email_type_idx" ON "verification_token"("email", "type");

-- CreateIndex
CREATE INDEX "verification_token_expires_at_idx" ON "verification_token"("expires_at");

-- CreateIndex
CREATE INDEX "administrator_session_administrator_id_revoked_at_idx" ON "administrator_session"("administrator_id", "revoked_at");

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
