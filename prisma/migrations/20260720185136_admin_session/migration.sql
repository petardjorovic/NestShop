-- CreateTable
CREATE TABLE "administrator_session" (
    "administrator_session_id" SERIAL NOT NULL,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "administrator_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrator_session_pkey" PRIMARY KEY ("administrator_session_id")
);

-- CreateIndex
CREATE INDEX "administrator_session_administrator_id_idx" ON "administrator_session"("administrator_id");

-- CreateIndex
CREATE INDEX "administrator_session_expires_at_idx" ON "administrator_session"("expires_at");

-- AddForeignKey
ALTER TABLE "administrator_session" ADD CONSTRAINT "administrator_session_administrator_id_fkey" FOREIGN KEY ("administrator_id") REFERENCES "administrator"("administrator_id") ON DELETE CASCADE ON UPDATE CASCADE;
