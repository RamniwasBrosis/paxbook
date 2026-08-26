-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED');

-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "destinationId" TEXT,
ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "packageId" TEXT,
ADD COLUMN     "posterKey" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "TestimonialStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "testimonialDate" TIMESTAMP(3),
ADD COLUMN     "title" TEXT,
ADD COLUMN     "tripTitle" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "videoKey" TEXT;

-- AlterTable: drop the backfill default on updatedAt so future rows behave like every
-- other @updatedAt column in this schema (value set by Prisma Client on every write, no
-- DB-level default) — the DEFAULT above only existed to satisfy the NOT NULL backfill for
-- the 4 pre-existing rows.
ALTER TABLE "testimonials" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "testimonials_tenantId_slug_key" ON "testimonials"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "testimonials_destinationId_idx" ON "testimonials"("destinationId");

-- CreateIndex
CREATE INDEX "testimonials_packageId_idx" ON "testimonials"("packageId");

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
