-- CreateTable
CREATE TABLE "administrator" (
    "administrator_id" SERIAL NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "password_hash" VARCHAR(128) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrator_pkey" PRIMARY KEY ("administrator_id")
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(128) NOT NULL,
    "forename" VARCHAR(64) NOT NULL,
    "surname" VARCHAR(64) NOT NULL,
    "phone_number" VARCHAR(24) NOT NULL,
    "postal_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrator_username_key" ON "administrator"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_number_key" ON "user"("phone_number");
