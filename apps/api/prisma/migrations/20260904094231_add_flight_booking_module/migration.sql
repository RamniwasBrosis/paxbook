-- CreateEnum
CREATE TYPE "FlightBookingStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "flight_bookings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "refId" TEXT,
    "flightId" TEXT,
    "tripType" INTEGER NOT NULL,
    "serType" INTEGER NOT NULL,
    "depCity" TEXT NOT NULL,
    "arrCity" TEXT NOT NULL,
    "onDate" TEXT NOT NULL,
    "reDate" TEXT,
    "adt" INTEGER NOT NULL,
    "chd" INTEGER NOT NULL,
    "inf" INTEGER NOT NULL,
    "cabin" TEXT NOT NULL,
    "fareType" TEXT NOT NULL,
    "searchSnapshot" JSONB,
    "fareSnapshot" JSONB,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "FlightBookingStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "pnr" TEXT,
    "providerStatus" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flight_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_passengers" (
    "id" TEXT NOT NULL,
    "flightBookingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "pType" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "ppNo" TEXT,
    "ppIss" TEXT,
    "ppExp" TEXT,
    "ppNat" TEXT,
    "paxId" TEXT,
    "pnr" TEXT,
    "ticketNo" TEXT,
    "barcodeText1" TEXT,
    "barcodeText2" TEXT,
    "barcodeText3" TEXT,

    CONSTRAINT "flight_passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "flightBookingId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "providerRef" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PaymentRecordStatus" NOT NULL DEFAULT 'CREATED',
    "method" TEXT,
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flight_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_booking_status_history" (
    "id" TEXT NOT NULL,
    "flightBookingId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flight_booking_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_api_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "endpoint" TEXT NOT NULL,
    "requestBody" JSONB,
    "responseBody" JSONB,
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flight_api_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flight_bookings_clientId_key" ON "flight_bookings"("clientId");

-- CreateIndex
CREATE INDEX "flight_bookings_tenantId_idx" ON "flight_bookings"("tenantId");

-- CreateIndex
CREATE INDEX "flight_bookings_customerId_idx" ON "flight_bookings"("customerId");

-- CreateIndex
CREATE INDEX "flight_payments_tenantId_idx" ON "flight_payments"("tenantId");

-- CreateIndex
CREATE INDEX "flight_api_logs_endpoint_idx" ON "flight_api_logs"("endpoint");

-- CreateIndex
CREATE INDEX "flight_api_logs_createdAt_idx" ON "flight_api_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "flight_bookings" ADD CONSTRAINT "flight_bookings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_bookings" ADD CONSTRAINT "flight_bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_passengers" ADD CONSTRAINT "flight_passengers_flightBookingId_fkey" FOREIGN KEY ("flightBookingId") REFERENCES "flight_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_payments" ADD CONSTRAINT "flight_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_payments" ADD CONSTRAINT "flight_payments_flightBookingId_fkey" FOREIGN KEY ("flightBookingId") REFERENCES "flight_bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_booking_status_history" ADD CONSTRAINT "flight_booking_status_history_flightBookingId_fkey" FOREIGN KEY ("flightBookingId") REFERENCES "flight_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
