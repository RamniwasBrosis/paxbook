import { Module } from "@nestjs/common";
import { VendorAuthModule } from "../vendor-auth/vendor-auth.module";
import { VendorProfileController } from "./vendor-profile.controller";
import { VendorProfileService } from "./vendor-profile.service";
import { VendorContractsController } from "./vendor-contracts.controller";
import { VendorContractsService } from "./vendor-contracts.service";
import { VendorPaymentsController } from "./vendor-payments.controller";
import { VendorPaymentsService } from "./vendor-payments.service";
import { VendorAssignmentsController } from "./vendor-assignments.controller";
import { VendorAssignmentsService } from "./vendor-assignments.service";
import { VendorUploadsController } from "./vendor-uploads.controller";

@Module({
  imports: [VendorAuthModule],
  controllers: [
    VendorProfileController,
    VendorContractsController,
    VendorPaymentsController,
    VendorAssignmentsController,
    VendorUploadsController,
  ],
  providers: [VendorProfileService, VendorContractsService, VendorPaymentsService, VendorAssignmentsService],
})
export class VendorPortalModule {}
