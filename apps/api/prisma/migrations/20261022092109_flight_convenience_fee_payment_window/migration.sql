-- AlterTable
ALTER TABLE "flight_bookings" ADD COLUMN     "convenienceFee" DECIMAL(12,2),
ADD COLUMN     "marginAmount" DECIMAL(12,2),
ADD COLUMN     "paymentExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "flight_pricing_settings" ADD COLUMN     "convenienceFeeEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "convenienceFeeGstPercent" DECIMAL(5,2) NOT NULL DEFAULT 18,
ADD COLUMN     "paymentWindowMinutes" INTEGER NOT NULL DEFAULT 9;
