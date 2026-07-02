-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('AVAILABLE', 'VISIBLE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('REJECTED', 'ACCEPTED', 'SHIPPED', 'PENDING');

-- CreateTable
CREATE TABLE "category" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "image_path" VARCHAR(128) NOT NULL,
    "parent__category_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "article" (
    "article_id" SERIAL NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "excerpt" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "is_promoted" BOOLEAN NOT NULL DEFAULT false,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_pkey" PRIMARY KEY ("article_id")
);

-- CreateTable
CREATE TABLE "feature" (
    "feature_id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_pkey" PRIMARY KEY ("feature_id")
);

-- CreateTable
CREATE TABLE "article_feature" (
    "article_feature_id" SERIAL NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "article_id" INTEGER NOT NULL,
    "feature_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_feature_pkey" PRIMARY KEY ("article_feature_id")
);

-- CreateTable
CREATE TABLE "article_price" (
    "article_price_id" SERIAL NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "article_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_price_pkey" PRIMARY KEY ("article_price_id")
);

-- CreateTable
CREATE TABLE "photo" (
    "photo_id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "image_path" VARCHAR(128) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("photo_id")
);

-- CreateTable
CREATE TABLE "cart" (
    "cart_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("cart_id")
);

-- CreateTable
CREATE TABLE "cart_article" (
    "cart_article_id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "article_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_article_pkey" PRIMARY KEY ("cart_article_id")
);

-- CreateTable
CREATE TABLE "order_log" (
    "order_log_id" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "cart_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_log_pkey" PRIMARY KEY ("order_log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "category_image_path_key" ON "category"("image_path");

-- CreateIndex
CREATE INDEX "category_parent__category_id_idx" ON "category"("parent__category_id");

-- CreateIndex
CREATE INDEX "article_category_id_idx" ON "article"("category_id");

-- CreateIndex
CREATE INDEX "feature_category_id_idx" ON "feature"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_name_category_id_key" ON "feature"("name", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "article_feature_article_id_feature_id_key" ON "article_feature"("article_id", "feature_id");

-- CreateIndex
CREATE INDEX "article_price_article_id_idx" ON "article_price"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "photo_image_path_key" ON "photo"("image_path");

-- CreateIndex
CREATE INDEX "photo_article_id_idx" ON "photo"("article_id");

-- CreateIndex
CREATE INDEX "cart_user_id_idx" ON "cart"("user_id");

-- CreateIndex
CREATE INDEX "cart_article_cart_id_idx" ON "cart_article"("cart_id");

-- CreateIndex
CREATE INDEX "cart_article_article_id_idx" ON "cart_article"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_article_cart_id_article_id_key" ON "cart_article"("cart_id", "article_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_log_cart_id_key" ON "order_log"("cart_id");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parent__category_id_fkey" FOREIGN KEY ("parent__category_id") REFERENCES "category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature" ADD CONSTRAINT "feature_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_feature" ADD CONSTRAINT "article_feature_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("article_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_feature" ADD CONSTRAINT "article_feature_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature"("feature_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_price" ADD CONSTRAINT "article_price_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("article_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("article_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_article" ADD CONSTRAINT "cart_article_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("cart_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_article" ADD CONSTRAINT "cart_article_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("article_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_log" ADD CONSTRAINT "order_log_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("cart_id") ON DELETE RESTRICT ON UPDATE CASCADE;
