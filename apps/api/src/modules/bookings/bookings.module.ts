import { Module } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";
import { BookingNotifier } from "./booking-notifier.service";

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, BookingNotifier],
  exports: [BookingsService, BookingNotifier],
})
export class BookingsModule {}
