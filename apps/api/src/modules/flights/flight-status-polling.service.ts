import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../common/prisma/prisma.service";
import { FlightsService } from "./flights.service";

const POLL_CUTOFF_MS = 7 * 60 * 1000; // FTD's own guidance: don't poll a given booking more than once every 7 minutes.

/**
 * A customer or admin can manually refresh a PENDING_CONFIRMATION booking's status today
 * (FlightsService.refreshStatus, already rate-limited and already tested), but nothing ever did
 * that on its own — a booking left pending with nobody revisiting the page would just sit there
 * forever. This sweeps for exactly those bookings and re-polls each one for real, reusing the same
 * already-verified refreshStatus logic (no separate status-mapping code to maintain).
 */
@Injectable()
export class FlightStatusPollingService implements OnModuleInit {
  private readonly logger = new Logger(FlightStatusPollingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly flights: FlightsService,
  ) {}

  onModuleInit() {
    this.logger.log("Automatic booking-status polling scheduled — every 10 minutes, for bookings pending 7+ minutes.");
  }

  @Cron("*/10 * * * *")
  async pollPendingBookings() {
    await this.runPoll();
  }

  async runPoll(): Promise<{ checked: number; updated: number }> {
    const cutoff = new Date(Date.now() - POLL_CUTOFF_MS);
    const pending = await this.prisma.flightBooking.findMany({
      where: { status: "PENDING_CONFIRMATION", refId: { not: null }, updatedAt: { lt: cutoff } },
      select: { id: true, tenantId: true, customerId: true, status: true },
    });

    let updated = 0;
    for (const booking of pending) {
      try {
        const result = await this.flights.refreshStatus(booking.tenantId, booking.customerId, booking.id);
        if (result.status !== booking.status) updated++;
      } catch (err) {
        this.logger.warn(`Failed to refresh status for booking ${booking.id}: ${(err as Error).message}`);
      }
    }
    if (pending.length > 0) {
      this.logger.log(`Polled ${pending.length} pending booking(s), ${updated} changed status.`);
    }
    return { checked: pending.length, updated };
  }
}
