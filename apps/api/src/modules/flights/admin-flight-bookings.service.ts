import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { FlightBookingDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RazorpayService } from "../customer-portal/razorpay.service";
import { FlightsService } from "./flights.service";
import { extractFlightSnapshot } from "./flight-response-mapper";

@Injectable()
export class AdminFlightBookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly flights: FlightsService,
    private readonly razorpay: RazorpayService,
  ) {}

  /** Delegates to FlightsService so the FTD cancelFlight payload/response handling lives in one place. */
  async cancel(tenantId: string, id: string, reason: string, canMode = 5): Promise<FlightBookingDto> {
    return this.flights.cancelBooking(tenantId, null, id, reason, canMode);
  }

  /** Admin-approved refund of an already-cancelled booking, issued against the captured Razorpay payment. */
  async refund(tenantId: string, id: string, amount: number, note?: string): Promise<FlightBookingDto> {
    const booking = await this.prisma.flightBooking.findFirst({
      where: { id, tenantId },
      include: { passengers: true, payments: { where: { status: "CAPTURED" }, orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!booking) throw new NotFoundException({ code: "FLIGHT_BOOKING_NOT_FOUND", message: "Booking does not exist." });
    if (booking.status !== "CANCELLED" && booking.status !== "CANCELLATION_PENDING") {
      throw new BadRequestException({ code: "REFUND_NOT_ALLOWED", message: "Only a cancelled booking can be refunded." });
    }
    const payment = booking.payments[0];
    if (!payment?.providerPaymentId) {
      throw new BadRequestException({ code: "NO_CAPTURED_PAYMENT", message: "This booking has no captured payment on file to refund." });
    }
    if (amount <= 0 || amount > booking.totalAmount.toNumber()) {
      throw new BadRequestException({ code: "INVALID_REFUND_AMOUNT", message: "Refund amount must be greater than 0 and cannot exceed what the customer paid." });
    }

    const result = await this.razorpay.refund(tenantId, payment.providerPaymentId, amount, note ? { note } : undefined);

    await this.prisma.$transaction([
      this.prisma.flightBooking.update({
        where: { id: booking.id },
        data: { paymentStatus: "REFUNDED", refundAmount: amount, refundedAt: new Date(), refundReference: result.refundId },
      }),
      this.prisma.flightPayment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } }),
      this.prisma.flightBookingStatusHistory.create({
        data: { flightBookingId: booking.id, fromStatus: booking.status, toStatus: booking.status, note: `Refunded ₹${amount}${note ? ` — ${note}` : ""} (ref ${result.refundId})` },
      }),
    ]);

    const updated = await this.prisma.flightBooking.findFirstOrThrow({ where: { id: booking.id }, include: { passengers: true } });
    return this.toDto(updated);
  }

  async findAll(tenantId: string, status?: string): Promise<FlightBookingDto[]> {
    const bookings = await this.prisma.flightBooking.findMany({
      where: { tenantId, ...(status ? { status: status as never } : {}) },
      include: { passengers: true, customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return bookings.map((b) => this.toDto(b));
  }

  async findOne(tenantId: string, id: string): Promise<FlightBookingDto & { statusHistory: Array<{ id: string; fromStatus: string | null; toStatus: string; note: string | null; changedAt: string }> }> {
    const booking = await this.prisma.flightBooking.findFirst({
      where: { id, tenantId },
      include: { passengers: true, customer: { select: { name: true, email: true } }, statusHistory: { orderBy: { changedAt: "asc" } }, payments: true },
    });
    if (!booking) throw new NotFoundException({ code: "FLIGHT_BOOKING_NOT_FOUND", message: "Booking does not exist." });
    return {
      ...this.toDto(booking),
      statusHistory: booking.statusHistory.map((h) => ({ id: h.id, fromStatus: h.fromStatus, toStatus: h.toStatus, note: h.note, changedAt: h.changedAt.toISOString() })),
    };
  }

  private toDto(b: {
    id: string; clientId: string; refId: string | null; depCity: string; arrCity: string; onDate: string; reDate: string | null;
    adt: number; chd: number; inf: number; cabin: string; fareSnapshot: unknown; providerFareAmount: { toNumber(): number } | null; totalAmount: { toNumber(): number }; currency: string; status: string;
    paymentStatus: string; pnr: string | null; providerStatus: string | null; errorMessage: string | null;
    cancellationReason: string | null; cancellationStatus: string | null; cancelledAt: Date | null;
    refundAmount: { toNumber(): number } | null; refundedAt: Date | null; refundReference: string | null; tripId: string | null; tripRole: string | null;
    createdAt: Date; updatedAt: Date;
    customer?: { name: string; email: string } | null;
    passengers: Array<{ id: string; title: string; fName: string; lName: string; pType: string; gender: string; dob: string; documentId: string | null; ppNo: string | null; ppNat: string | null; paxId: string | null; pnr: string | null; ticketNo: string | null }>;
  }): FlightBookingDto {
    const snapshot = extractFlightSnapshot(b.fareSnapshot);
    return {
      id: b.id,
      clientId: b.clientId,
      refId: b.refId,
      depCity: b.depCity,
      arrCity: b.arrCity,
      onDate: b.onDate,
      reDate: b.reDate,
      adt: b.adt,
      chd: b.chd,
      inf: b.inf,
      cabin: b.cabin,
      legs: snapshot.legs,
      returnLegs: snapshot.returnLegs,
      fare: snapshot.fare,
      providerFareAmount: b.providerFareAmount ? b.providerFareAmount.toNumber() : null,
      totalAmount: b.totalAmount.toNumber(),
      currency: b.currency,
      status: b.status as FlightBookingDto["status"],
      paymentStatus: b.paymentStatus as FlightBookingDto["paymentStatus"],
      pnr: b.pnr,
      providerStatus: b.providerStatus,
      errorMessage: b.errorMessage,
      cancellationReason: b.cancellationReason,
      cancellationStatus: b.cancellationStatus,
      cancelledAt: b.cancelledAt ? b.cancelledAt.toISOString() : null,
      refundAmount: b.refundAmount ? b.refundAmount.toNumber() : null,
      refundedAt: b.refundedAt ? b.refundedAt.toISOString() : null,
      refundReference: b.refundReference,
      tripId: b.tripId,
      tripRole: b.tripRole as FlightBookingDto["tripRole"],
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      customerName: b.customer?.name,
      customerEmail: b.customer?.email,
      passengers: b.passengers.map((p) => ({
        id: p.id, title: p.title, fName: p.fName, lName: p.lName, pType: p.pType, gender: p.gender, dob: p.dob,
        documentId: p.documentId, ppNo: p.ppNo, ppNat: p.ppNat, paxId: p.paxId, pnr: p.pnr, ticketNo: p.ticketNo,
      })),
    };
  }
}
