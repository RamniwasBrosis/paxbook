-- AlterEnum
ALTER TYPE "FlightBookingStatus" ADD VALUE 'CANCELLATION_PENDING';

-- AlterTable
ALTER TABLE "flight_bookings"
  ADD COLUMN     "cancellationReason" TEXT,
  ADD COLUMN     "cancellationStatus" TEXT,
  ADD COLUMN     "cancelledAt" TIMESTAMP(3),
  ADD COLUMN     "refundAmount" DECIMAL(12,2),
  ADD COLUMN     "refundedAt" TIMESTAMP(3),
  ADD COLUMN     "refundReference" TEXT;

-- AlterTable
ALTER TABLE "flight_payments"
  ADD COLUMN     "providerPaymentId" TEXT;
