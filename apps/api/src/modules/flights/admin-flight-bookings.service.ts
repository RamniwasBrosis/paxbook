import { Injectable, NotFoundException } from "@nestjs/common";
import type { FlightBookingDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class AdminFlightBookingsService {
  constructor(private readonly prisma: PrismaService) {}

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
    adt: number; chd: number; inf: number; cabin: string; totalAmount: { toNumber(): number }; currency: string; status: string;
    paymentStatus: string; pnr: string | null; providerStatus: string | null; errorMessage: string | null; createdAt: Date; updatedAt: Date;
    customer?: { name: string; email: string } | null;
    passengers: Array<{ id: string; title: string; fName: string; lName: string; pType: string; gender: string; dob: string; documentId: string | null; ppNo: string | null; ppNat: string | null; paxId: string | null; pnr: string | null; ticketNo: string | null }>;
  }): FlightBookingDto {
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
      totalAmount: b.totalAmount.toNumber(),
      currency: b.currency,
      status: b.status as FlightBookingDto["status"],
      paymentStatus: b.paymentStatus as FlightBookingDto["paymentStatus"],
      pnr: b.pnr,
      providerStatus: b.providerStatus,
      errorMessage: b.errorMessage,
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
