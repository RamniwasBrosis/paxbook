-- AlterTable
ALTER TABLE "banners" ADD COLUMN     "ctaText" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT;
