-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "category" TEXT,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "readMinutes" INTEGER;

-- AlterTable
ALTER TABLE "countries" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "destinations" ADD COLUMN     "bestTimeToVisit" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "packages" ADD COLUMN     "inclusions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "visa_info" ADD COLUMN     "isVisaFree" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "requiredDocuments",
ADD COLUMN     "requiredDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "destination_highlights" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "destination_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_activities" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "destination_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_hotel_suggestions" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "name" TEXT,
    "starRating" INTEGER NOT NULL,
    "area" TEXT NOT NULL,
    "descriptor" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "destination_hotel_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "destination_highlights_destinationId_idx" ON "destination_highlights"("destinationId");

-- CreateIndex
CREATE INDEX "destination_activities_destinationId_idx" ON "destination_activities"("destinationId");

-- CreateIndex
CREATE INDEX "destination_hotel_suggestions_destinationId_idx" ON "destination_hotel_suggestions"("destinationId");

-- AddForeignKey
ALTER TABLE "destination_highlights" ADD CONSTRAINT "destination_highlights_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_activities" ADD CONSTRAINT "destination_activities_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_hotel_suggestions" ADD CONSTRAINT "destination_hotel_suggestions_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

