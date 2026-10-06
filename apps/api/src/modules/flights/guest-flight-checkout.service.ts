import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { FlightBookingDto, FlightTripDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { FlightsService } from "./flights.service";
import type { CreateFlightBookingDto } from "./dto/create-flight-booking.dto";
import type { CreateRoundTripFlightBookingDto } from "./dto/create-round-trip-flight-booking.dto";

type GuestScope = "booking" | "trip";

/**
 * Flight checkout without logging in. The booking is filed under the customer who owns the contact
 * email (a new password-less customer when there is none), but the guest never gets a session for
 * that account — typing someone's email can't open their account. Instead the guest gets a signed
 * token that works only for this one booking or trip: paying for it and viewing it afterwards.
 */
@Injectable()
export class GuestFlightCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly flights: FlightsService,
  ) {}

  async createBooking(tenantId: string, dto: CreateFlightBookingDto): Promise<{ booking: FlightBookingDto; guestToken: string }> {
    const customerId = await this.customerFor(tenantId, dto.email, dto.mobile, dto.passengers[0]);
    const booking = await this.flights.createDraftBooking(tenantId, customerId, dto, dto.searchContext);
    return { booking, guestToken: this.sign("booking", booking.id) };
  }

  async createTrip(tenantId: string, dto: CreateRoundTripFlightBookingDto): Promise<{ trip: FlightTripDto; guestToken: string }> {
    const customerId = await this.customerFor(tenantId, dto.email, dto.mobile, dto.passengers[0]);
    const trip = await this.flights.createRoundTripDraftBooking(tenantId, customerId, dto);
    return { trip, guestToken: this.sign("trip", trip.tripId) };
  }

  /** The owning customer of a guest booking, after checking the token; 404 on any mismatch. */
  async bookingCustomer(tenantId: string, bookingId: string, token: string | undefined): Promise<string> {
    this.verify("booking", bookingId, token);
    const booking = await this.prisma.flightBooking.findFirst({ where: { id: bookingId, tenantId, tripId: null }, select: { customerId: true } });
    if (!booking) throw notFound();
    return booking.customerId;
  }

  async tripCustomer(tenantId: string, tripId: string, token: string | undefined): Promise<string> {
    this.verify("trip", tripId, token);
    const booking = await this.prisma.flightBooking.findFirst({ where: { tripId, tenantId }, select: { customerId: true } });
    if (!booking) throw notFound();
    return booking.customerId;
  }

  private async customerFor(tenantId: string, rawEmail: string, rawMobile: string, firstPassenger?: { fName?: string; lName?: string }): Promise<string> {
    const email = rawEmail.trim().toLowerCase();
    const existing = await this.prisma.customer.findFirst({ where: { tenantId, email: { equals: email, mode: "insensitive" } }, select: { id: true } });
    if (existing) return existing.id;

    const phone = rawMobile.replace(/\D/g, "").slice(-10) || null;
    // Phone is unique per site; leave it off rather than fail when another account already has it.
    const phoneTaken = phone ? await this.prisma.customer.findFirst({ where: { tenantId, phone }, select: { id: true } }) : null;
    const name = [firstPassenger?.fName, firstPassenger?.lName].filter(Boolean).join(" ").trim() || email.split("@")[0]!;
    try {
      const created = await this.prisma.customer.create({ data: { tenantId, name, email, phone: phoneTaken ? null : phone }, select: { id: true } });
      return created.id;
    } catch {
      // Two guest checkouts with the same email at once: the other one created it.
      const again = await this.prisma.customer.findFirst({ where: { tenantId, email: { equals: email, mode: "insensitive" } }, select: { id: true } });
      if (!again) throw notFound();
      return again.id;
    }
  }

  private sign(scope: GuestScope, id: string): string {
    const secret = this.config.getOrThrow<string>("CUSTOMER_JWT_ACCESS_SECRET");
    return createHmac("sha256", secret).update(`flight-guest:${scope}:${id}`).digest("base64url");
  }

  private verify(scope: GuestScope, id: string, token: string | undefined): void {
    if (!token) throw notFound();
    const expected = Buffer.from(this.sign(scope, id));
    const given = Buffer.from(token);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) throw notFound();
  }
}

function notFound() {
  return new NotFoundException({ code: "FLIGHT_BOOKING_NOT_FOUND", message: "Booking does not exist." });
}
