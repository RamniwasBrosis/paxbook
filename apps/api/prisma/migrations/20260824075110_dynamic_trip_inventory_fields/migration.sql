-- AlterTable
ALTER TABLE "itinerary_days" ADD COLUMN     "imageStorageKey" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "mealsIncluded" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "package_activities" ADD COLUMN     "imageStorageKey" TEXT,
ADD COLUMN     "timeLabel" TEXT;

-- AlterTable
ALTER TABLE "package_flights" ADD COLUMN     "dayNumber" INTEGER;

-- AlterTable
ALTER TABLE "package_hotels" ADD COLUMN     "imageStorageKey" TEXT;
