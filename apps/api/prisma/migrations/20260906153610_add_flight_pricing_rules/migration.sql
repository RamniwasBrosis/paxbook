-- AlterTable
ALTER TABLE "flight_bookings" ADD COLUMN     "providerFareAmount" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "flight_pricing_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "marginPercent" DECIMAL(6,3) NOT NULL DEFAULT 0,
    "marginFlat" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flight_pricing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_route_pricing_rules" (
    "id" TEXT NOT NULL,
    "depCity" TEXT NOT NULL,
    "arrCity" TEXT NOT NULL,
    "marginPercent" DECIMAL(6,3) NOT NULL DEFAULT 0,
    "marginFlat" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flight_route_pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flight_route_pricing_rules_depCity_arrCity_key" ON "flight_route_pricing_rules"("depCity", "arrCity");
