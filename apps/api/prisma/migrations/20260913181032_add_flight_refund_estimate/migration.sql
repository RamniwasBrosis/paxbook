-- AlterTable
ALTER TABLE "flight_bookings" ADD COLUMN     "estimatedCancellationFee" DECIMAL(12,2),
ADD COLUMN     "estimatedRefundAmount" DECIMAL(12,2),
ADD COLUMN     "refundEstimateComputedAt" TIMESTAMP(3),
ADD COLUMN     "refundEstimateNote" TEXT,
ADD COLUMN     "refundEstimateSnapshot" JSONB;

-- RenameIndex
ALTER INDEX "flight_route_pricing_rules_depCity_arrCity_airlineCode_fl_key1" RENAME TO "flight_route_pricing_rules_depCity_arrCity_airlineCode_flig_key";
