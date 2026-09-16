-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "ftdEnabled" BOOLEAN NOT NULL DEFAULT false;

-- DataFix: only the tenant that actually holds the FTD agency relationship gets access to the
-- flights module's admin-only FTD passthrough endpoints (statement, balance) — see the column
-- comment in schema.prisma for why this exists.
UPDATE "tenants" SET "ftdEnabled" = true WHERE "slug" = 'default';
