-- CreateTable
CREATE TABLE "package_category_map" (
    "packageId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "package_category_map_pkey" PRIMARY KEY ("packageId","categoryId")
);

-- CreateTable
CREATE TABLE "vendor_category_map" (
    "vendorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "vendor_category_map_pkey" PRIMARY KEY ("vendorId","categoryId")
);

-- AddForeignKey
ALTER TABLE "package_category_map" ADD CONSTRAINT "package_category_map_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_category_map" ADD CONSTRAINT "package_category_map_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "destination_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_category_map" ADD CONSTRAINT "vendor_category_map_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_category_map" ADD CONSTRAINT "vendor_category_map_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "destination_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
