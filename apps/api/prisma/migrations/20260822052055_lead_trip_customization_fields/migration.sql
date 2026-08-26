-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "departureCity" TEXT,
ADD COLUMN     "departureDate" TIMESTAMP(3),
ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "packageId" TEXT,
ADD COLUMN     "travellerType" TEXT,
ADD COLUMN     "tripDuration" TEXT;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
