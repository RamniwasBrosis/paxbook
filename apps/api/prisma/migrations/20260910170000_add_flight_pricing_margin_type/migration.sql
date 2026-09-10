-- AlterTable
ALTER TABLE "flight_pricing_settings"
  ADD COLUMN     "marginType" TEXT NOT NULL DEFAULT 'PERCENT';

-- AlterTable
ALTER TABLE "flight_route_pricing_rules"
  ADD COLUMN     "marginType" TEXT NOT NULL DEFAULT 'PERCENT';

-- Existing rows that only ever set a flat amount (percent left at 0) keep working as flat rules;
-- everything else (percent-only, or both set — which used to silently stack) defaults to PERCENT.
UPDATE "flight_pricing_settings" SET "marginType" = 'FLAT' WHERE "marginPercent" = 0 AND "marginFlat" != 0;
UPDATE "flight_route_pricing_rules" SET "marginType" = 'FLAT' WHERE "marginPercent" = 0 AND "marginFlat" != 0;
