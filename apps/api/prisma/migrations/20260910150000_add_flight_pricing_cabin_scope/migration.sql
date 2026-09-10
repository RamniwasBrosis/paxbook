-- DropIndex
DROP INDEX "flight_route_pricing_rules_depCity_arrCity_airlineCode_fl_key";

-- AlterTable
ALTER TABLE "flight_route_pricing_rules"
  ADD COLUMN     "cabin" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "flight_route_pricing_rules_depCity_arrCity_airlineCode_fl_key1" ON "flight_route_pricing_rules"("depCity", "arrCity", "airlineCode", "flightNo", "cabin");
