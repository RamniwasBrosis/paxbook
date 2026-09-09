-- DropIndex
DROP INDEX "flight_route_pricing_rules_depCity_arrCity_key";

-- AlterTable
ALTER TABLE "flight_route_pricing_rules"
  ADD COLUMN     "airlineCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN     "flightNo" TEXT NOT NULL DEFAULT '',
  ADD COLUMN     "label" TEXT;

-- CreateIndex
CREATE INDEX "flight_route_pricing_rules_depCity_arrCity_idx" ON "flight_route_pricing_rules"("depCity", "arrCity");

-- CreateIndex
CREATE UNIQUE INDEX "flight_route_pricing_rules_depCity_arrCity_airlineCode_fl_key" ON "flight_route_pricing_rules"("depCity", "arrCity", "airlineCode", "flightNo");
