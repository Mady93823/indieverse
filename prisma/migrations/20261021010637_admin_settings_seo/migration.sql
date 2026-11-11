-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'EDITOR');

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'OWNER';

-- AlterTable
ALTER TABLE "artists" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "instagram_url" TEXT,
ADD COLUMN     "name_tamil" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "spotify_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "youtube_url" TEXT;

-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "about" TEXT,
ADD COLUMN     "admin_note" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hide_ads" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_title" TEXT;

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "pages" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "redirects" (
    "from_path" TEXT NOT NULL,
    "to_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redirects_pkey" PRIMARY KEY ("from_path")
);

-- CreateIndex
CREATE INDEX "redirects_to_path_idx" ON "redirects"("to_path");
