import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { BookingDetailDto, PaymentOrderDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { BookingsService } from "../bookings/bookings.service";
import { PaymentsService } from "../finance/payments.service";
import { InvoicesService } from "../finance/invoices.service";
import { RazorpayService } from "./razorpay.service";
import { CustomerNotificationsService } from "./customer-notifications.service";
import { EmailService } from "../../common/email/email.service";
import { SmsService } from "../../common/sms/sms.service";
import type { VerifyPaymentDto } from "./dto/verify-payment.dto";

@Injectable()
export class CustomerPaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingsService: BookingsService,
    private readonly paymentsService: PaymentsService,
    private readonly invoicesService: InvoicesService,
    private readonly razorpayService: RazorpayService,
    private readonly notificationsService: CustomerNotificationsService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async createOrder(tenantId: string, customerId: string, bookingId: string): Promise<PaymentOrderDto> {
    const booking = await this.getOwnedBooking(tenantId, customerId, bookingId);

    const capturedAgg = await this.prisma.payment.aggregate({ where: { bookingId, status: "CAPTURED" }, _sum: { amount: true } });
    const alreadyCaptured = capturedAgg._sum.amount?.toNumber() ?? 0;
    const outstanding = booking.totalAmount.toNumber() - alreadyCaptured;
    if (outstanding <= 0) {
      throw new BadRequestException({ code: "BOOKING_ALREADY_PAID", message: "This booking is already fully paid." });
    }

    const payment = await this.paymentsService.create(tenantId, { bookingId, amount: outstanding, provider: "razorpay" });
    const order = await this.razorpayService.createOrder(tenantId, outstanding, booking.currency, payment.id);
    await this.prisma.payment.update({ where: { id: payment.id }, data: { providerRef: order.orderId } });

    return { paymentId: payment.id, orderId: order.orderId, amount: order.amount, currency: order.currency, keyId: order.keyId, mock: order.mock };
  }

  async verifyPayment(
    tenantId: string,
    customerId: string,
    bookingId: string,
    paymentId: string,
    dto: VerifyPaymentDto,
  ): Promise<BookingDetailDto> {
    const booking = await this.getOwnedBooking(tenantId, customerId, bookingId);
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, bookingId, tenantId } });
    if (!payment) {
      throw new NotFoundException({ code: "PAYMENT_NOT_FOUND", message: "Payment does not exist." });
    }

    if (await this.razorpayService.isConfigured(tenantId)) {
      if (!dto.razorpayOrderId || !dto.razorpayPaymentId || !dto.razorpaySignature) {
        throw new BadRequestException({ code: "PAYMENT_VERIFICATION_INCOMPLETE", message: "Missing Razorpay verification fields." });
      }
      const valid = await this.razorpayService.verifySignature(tenantId, dto.razorpayOrderId, dto.razorpayPaymentId, dto.razorpaySignature);
      if (!valid) {
        throw new UnauthorizedException({ code: "PAYMENT_SIGNATURE_INVALID", message: "Payment verification failed." });
      }
    } else if (!dto.devConfirm) {
      throw new BadRequestException({ code: "PAYMENT_NOT_CONFIRMED", message: "Payment was not confirmed." });
    }

    await this.paymentsService.setStatus(tenantId, paymentId, { status: "CAPTURED" });
    await this.notificationsService.create(
      tenantId,
      customerId,
      "PAYMENT",
      "Payment received",
      `We've received your payment of ${payment.amount.toNumber()} ${booking.currency}.`,
    );

    const refreshedBooking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    if (refreshedBooking.paymentStatus === "PAID" && refreshedBooking.status === "DRAFT") {
      await this.bookingsService.setStatus(tenantId, bookingId, null, { toStatus: "CONFIRMED", note: "Auto-confirmed after payment" });
      await this.invoicesService.create(tenantId, { bookingId, amount: refreshedBooking.totalAmount.toNumber() });
      await this.notificationsService.create(
        tenantId,
        customerId,
        "BOOKING_STATUS",
        "Booking confirmed",
        "Your booking is fully paid and confirmed. Your invoice and travel voucher are now available.",
      );

      const customer = await this.prisma.customer.findUnique({ where: { id: customerId }, select: { email: true, phone: true, name: true } });
      if (customer?.email) {
        await this.emailService.send(
          tenantId,
          customer.email,
          "Your Paxbook booking is confirmed",
          `<p>Hi ${customer.name},</p><p>Your booking <b>${refreshedBooking.id}</b> is fully paid and confirmed. You can download your invoice and travel voucher from your Paxbook account.</p>`,
        );
      }
      if (customer?.phone) {
        await this.smsService.sendWhatsapp(
          tenantId,
          customer.phone,
          `Hi ${customer.name}, your Paxbook booking is confirmed and fully paid. Your invoice and voucher are ready in your account.`,
        );
      }
    }

    return this.bookingsService.findOneForCustomer(tenantId, customerId, bookingId);
  }

  private async getOwnedBooking(tenantId: string, customerId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({ where: { id: bookingId, tenantId, customerId } });
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Booking does not exist." });
    }
    return booking;
  }
}
