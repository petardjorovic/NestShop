/*
  Warnings:

  - You are about to drop the column `image_path` on the `photo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[public_id]` on the table `photo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[image_url]` on the table `photo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image_url` to the `photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_id` to the `photo` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "photo_image_path_key";

-- AlterTable
ALTER TABLE "photo" DROP COLUMN "image_path",
ADD COLUMN     "image_url" TEXT NOT NULL,
ADD COLUMN     "public_id" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "photo_public_id_key" ON "photo"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "photo_image_url_key" ON "photo"("image_url");
