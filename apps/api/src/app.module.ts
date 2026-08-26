import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { apiEnvSchema } from "@paxbook/config";

import { PrismaModule } from "./common/prisma/prisma.module";
import { TenantModule } from "./common/tenant/tenant.module";
import { TenantResolverMiddleware } from "./common/tenant/tenant-resolver.middleware";
import { StorageModule } from "./common/storage/storage.module";
import { SmsModule } from "./common/sms/sms.module";
import { EmailModule } from "./common/email/email.module";
import { CacheModule } from "./common/cache/cache.module";
import { BackupModule } from "./common/backup/backup.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { AuditInterceptor } from "./common/interceptors/audit.interceptor";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

import { AuditLogModule } from "./modules/audit-log/audit-log.module";
import { RolesModule } from "./modules/roles/roles.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { DestinationsModule } from "./modules/destinations/destinations.module";
import { PackagesModule } from "./modules/packages/packages.module";
import { TestimonialsModule } from "./modules/testimonials/testimonials.module";
import { CmsModule } from "./modules/cms/cms.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { OffersModule } from "./modules/offers/offers.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { CrmModule } from "./modules/crm/crm.module";
import { FinanceModule } from "./modules/finance/finance.module";
import { VendorsModule } from "./modules/vendors/vendors.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { PublicModule } from "./modules/public/public.module";
import { PublicContentController } from "./modules/public/public-content.controller";
import { PublicLeadsController } from "./modules/public/public-leads.controller";
import { CustomerAuthModule } from "./modules/customer-auth/customer-auth.module";
import { CustomerAuthController } from "./modules/customer-auth/customer-auth.controller";
import { CustomerPortalModule } from "./modules/customer-portal/customer-portal.module";
import { VendorAuthModule } from "./modules/vendor-auth/vendor-auth.module";
import { VendorAuthController } from "./modules/vendor-auth/vendor-auth.controller";
import { VendorPortalModule } from "./modules/vendor-portal/vendor-portal.module";
import { PlatformModule } from "./modules/platform/platform.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => apiEnvSchema.parse(config),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    TenantModule,
    StorageModule,
    SmsModule,
    EmailModule,
    CacheModule,
    BackupModule,
    ScheduleModule.forRoot(),
    AuditLogModule,
    RolesModule,
    UsersModule,
    AuthModule,
    UploadsModule,
    DestinationsModule,
    PackagesModule,
    TestimonialsModule,
    CmsModule,
    ReviewsModule,
    OffersModule,
    CustomersModule,
    BookingsModule,
    CrmModule,
    FinanceModule,
    VendorsModule,
    ReportsModule,
    PublicModule,
    CustomerAuthModule,
    CustomerPortalModule,
    VendorAuthModule,
    VendorPortalModule,
    PlatformModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TenantResolverMiddleware)
      .forRoutes(PublicContentController, PublicLeadsController, CustomerAuthController, VendorAuthController);
  }
}
