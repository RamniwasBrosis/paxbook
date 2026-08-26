-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "email" TEXT,
ADD COLUMN     "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "vendor_refresh_tokens" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_refresh_tokens_tokenHash_key" ON "vendor_refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "vendor_refresh_tokens_vendorId_idx" ON "vendor_refresh_tokens"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_tenantId_email_key" ON "vendors"("tenantId", "email");

-- AddForeignKey
ALTER TABLE "vendor_refresh_tokens" ADD CONSTRAINT "vendor_refresh_tokens_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

