import { Module } from "@nestjs/common";
import { BookingsModule } from "../bookings/bookings.module";
import { FinanceModule } from "../finance/finance.module";
import { CustomersModule } from "../customers/customers.module";
import { CustomerAuthModule } from "../customer-auth/customer-auth.module";
import { CustomerBookingsController } from "./customer-bookings.controller";
import { CustomerBookingsService } from "./customer-bookings.service";
import { CustomerPaymentsController } from "./customer-payments.controller";
import { CustomerPaymentsService } from "./customer-payments.service";
import { RazorpayService } from "./razorpay.service";
import { CustomerProfileController } from "./customer-profile.controller";
import { CustomerProfileService } from "./customer-profile.service";
import { CustomerWishlistController } from "./customer-wishlist.controller";
import { CustomerWishlistService } from "./customer-wishlist.service";
import { CustomerNotificationsController } from "./customer-notifications.controller";
import { CustomerNotificationsService } from "./customer-notifications.service";
import { CustomerReviewsController } from "./customer-reviews.controller";
import { CustomerReviewsService } from "./customer-reviews.service";
import { AdminCancellationRequestsController } from "./admin-cancellation-requests.controller";
import { AdminCancellationRequestsService } from "./admin-cancellation-requests.service";
import { CustomerUploadsController } from "./customer-uploads.controller";

@Module({
  imports: [BookingsModule, FinanceModule, CustomersModule, CustomerAuthModule],
  controllers: [
    CustomerBookingsController,
    CustomerPaymentsController,
    CustomerProfileController,
    CustomerWishlistController,
    CustomerNotificationsController,
    CustomerReviewsController,
    AdminCancellationRequestsController,
    CustomerUploadsController,
  ],
  providers: [
    CustomerBookingsService,
    CustomerPaymentsService,
    RazorpayService,
    CustomerProfileService,
    CustomerWishlistService,
    CustomerNotificationsService,
    CustomerReviewsService,
    AdminCancellationRequestsService,
  ],
})
export class CustomerPortalModule {}
