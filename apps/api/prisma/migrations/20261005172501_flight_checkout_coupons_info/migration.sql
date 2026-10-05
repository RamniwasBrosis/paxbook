-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "appliesTo" TEXT NOT NULL DEFAULT 'ALL',
ADD COLUMN     "showOnCheckout" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "flight_bookings" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "discountAmount" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "flightImportantInfo" JSONB;
