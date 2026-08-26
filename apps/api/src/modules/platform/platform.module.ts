import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TenantSignupController } from "./tenant-signup.controller";
import { TenantSignupService } from "./tenant-signup.service";
import { PlatformTenantsController } from "./platform-tenants.controller";
import { PlatformTenantsService } from "./platform-tenants.service";
import { PlatformPlansController } from "./platform-plans.controller";
import { PlatformPlansService } from "./platform-plans.service";
import { PlatformBillingController } from "./platform-billing.controller";
import { PlatformBillingService } from "./platform-billing.service";
import { RazorpaySubscriptionService } from "./razorpay-subscription.service";
import { TenantBrandingController } from "./tenant-branding.controller";
import { TenantBrandingService } from "./tenant-branding.service";
import { TenantIntegrationsController } from "./tenant-integrations.controller";
import { TenantIntegrationsService } from "./tenant-integrations.service";

@Module({
  imports: [AuthModule],
  controllers: [
    TenantSignupController,
    PlatformTenantsController,
    PlatformPlansController,
    PlatformBillingController,
    TenantBrandingController,
    TenantIntegrationsController,
  ],
  providers: [
    TenantSignupService,
    PlatformTenantsService,
    PlatformPlansService,
    PlatformBillingService,
    RazorpaySubscriptionService,
    TenantBrandingService,
    TenantIntegrationsService,
  ],
})
export class PlatformModule {}
