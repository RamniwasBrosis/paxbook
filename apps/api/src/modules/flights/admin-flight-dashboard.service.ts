import { Injectable } from "@nestjs/common";
import type { FlightDashboardBreakdownDto, FlightDashboardDailyFigureDto, FlightDashboardDto, FlightDashboardStatusCountDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

const DAYS_OF_TREND = 30;

function bump(map: Map<string, { bookings: number; revenue: number }>, key: string, revenue: number): void {
  const entry = map.get(key) ?? { bookings: 0, revenue: 0 };
  entry.bookings += 1;
  entry.revenue += revenue;
  map.set(key, entry);
}

function topN(map: Map<string, { bookings: number; revenue: number }>, n: number): FlightDashboardBreakdownDto[] {
  return [...map.entries()]
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n);
}

/** Pulls the airline actually flown out of the frozen price-check snapshot — never stored as its own
 * column, so this is the only reliable source (real API data, never guessed). */
function airlineFromSnapshot(fareSnapshot: unknown): { code: string; name: string } | null {
  const leg = (fareSnapshot as { option?: { legs?: Array<{ airlineCode?: string; airlineName?: string }> } } | null)?.option?.legs?.[0];
  if (!leg?.airlineCode) return null;
  return { code: leg.airlineCode, name: leg.airlineName || leg.airlineCode };
}

@Injectable()
export class AdminFlightDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(tenantId: string): Promise<FlightDashboardDto> {
    const bookings = await this.prisma.flightBooking.findMany({
      where: { tenantId },
      select: {
        status: true,
        paymentStatus: true,
        totalAmount: true,
        providerFareAmount: true,
        refundAmount: true,
        depCity: true,
        arrCity: true,
        fareSnapshot: true,
        createdAt: true,
      },
    });

    let confirmedBookings = 0;
    let pendingBookings = 0;
    let cancelledBookings = 0;
    let failedBookings = 0;
    let revenue = 0;
    let supplierCost = 0;
    let refunded = 0;

    const byStatus = new Map<string, number>();
    const byPaymentStatus = new Map<string, number>();
    const byRoute = new Map<string, { bookings: number; revenue: number }>();
    const byAirline = new Map<string, { bookings: number; revenue: number }>();
    const byDay = new Map<string, { bookings: number; revenue: number }>();

    for (const b of bookings) {
      byStatus.set(b.status, (byStatus.get(b.status) ?? 0) + 1);
      byPaymentStatus.set(b.paymentStatus, (byPaymentStatus.get(b.paymentStatus) ?? 0) + 1);

      if (b.status === "CONFIRMED") confirmedBookings += 1;
      else if (b.status === "PENDING_PAYMENT" || b.status === "PENDING_CONFIRMATION") pendingBookings += 1;
      else if (b.status === "CANCELLED" || b.status === "CANCELLATION_PENDING") cancelledBookings += 1;
      else if (b.status === "FAILED") failedBookings += 1;

      if (b.refundAmount) refunded += b.refundAmount.toNumber();

      // Only bookings that actually collected payment count toward revenue/cost/route/airline figures —
      // a DRAFT or FAILED booking never charged the customer or the provider, so it isn't real money.
      if (b.paymentStatus === "PAID" || b.paymentStatus === "REFUNDED") {
        const amount = b.totalAmount.toNumber();
        revenue += amount;
        supplierCost += b.providerFareAmount ? b.providerFareAmount.toNumber() : 0;
        bump(byRoute, `${b.depCity} → ${b.arrCity}`, amount);
        const airline = airlineFromSnapshot(b.fareSnapshot);
        if (airline) bump(byAirline, `${airline.name} (${airline.code})`, amount);

        const dayKey = b.createdAt.toISOString().slice(0, 10);
        const entry = byDay.get(dayKey) ?? { bookings: 0, revenue: 0 };
        entry.bookings += 1;
        entry.revenue += amount;
        byDay.set(dayKey, entry);
      }
    }

    const dailyLast30Days: FlightDashboardDailyFigureDto[] = [];
    for (let i = DAYS_OF_TREND - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? { bookings: 0, revenue: 0 };
      dailyLast30Days.push({ date: key, ...entry });
    }

    const toStatusCounts = (map: Map<string, number>): FlightDashboardStatusCountDto[] =>
      [...map.entries()].map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count);

    const margin = revenue - supplierCost;

    return {
      totalBookings: bookings.length,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      failedBookings,
      revenue,
      supplierCost,
      margin,
      refunded,
      netProfit: margin - refunded,
      byStatus: toStatusCounts(byStatus),
      byPaymentStatus: toStatusCounts(byPaymentStatus),
      topRoutes: topN(byRoute, 10),
      topAirlines: topN(byAirline, 10),
      dailyLast30Days,
    };
  }
}
