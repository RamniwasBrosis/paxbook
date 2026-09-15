-- AlterTable
ALTER TABLE "flight_bookings" ADD COLUMN     "dateChangeNewDate" TEXT,
ADD COLUMN     "dateChangeReissueId" TEXT,
ADD COLUMN     "dateChangeRemarks" TEXT,
ADD COLUMN     "dateChangeRequestedAt" TIMESTAMP(3),
ADD COLUMN     "dateChangeStatus" TEXT;
