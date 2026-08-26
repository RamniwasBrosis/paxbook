-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "razorpayKeyId" TEXT,
ADD COLUMN     "razorpayKeySecretEncrypted" TEXT,
ADD COLUMN     "twilioAccountSid" TEXT,
ADD COLUMN     "twilioAuthTokenEncrypted" TEXT,
ADD COLUMN     "twilioFromNumber" TEXT,
ADD COLUMN     "twilioWhatsappFromNumber" TEXT;

