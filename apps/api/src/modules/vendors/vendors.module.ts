import { Module } from "@nestjs/common";
import { VendorsController } from "./vendors.controller";
import { VendorsService } from "./vendors.service";
import { VendorContractsController } from "./vendor-contracts.controller";
import { VendorContractsService } from "./vendor-contracts.service";
import { VendorPaymentsController } from "./vendor-payments.controller";
import { VendorPaymentsService } from "./vendor-payments.service";

@Module({
  controllers: [VendorsController, VendorContractsController, VendorPaymentsController],
  providers: [VendorsService, VendorContractsService, VendorPaymentsService],
})
export class VendorsModule {}
