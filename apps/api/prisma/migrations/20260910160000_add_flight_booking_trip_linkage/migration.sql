-- AlterTable
ALTER TABLE "flight_bookings"
  ADD COLUMN     "tripId" TEXT,
  ADD COLUMN     "tripRole" TEXT;

-- CreateIndex
CREATE INDEX "flight_bookings_tripId_idx" ON "flight_bookings"("tripId");
