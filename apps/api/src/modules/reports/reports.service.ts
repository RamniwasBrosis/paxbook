import { Injectable } from "@nestjs/common";
import type {
  ConsultantPerformanceDto,
  MarketingReportDto,
  RevenueReportDto,
  SalesReportDto,
  SatisfactionReportDto,
} from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesReport(tenantId: string): Promise<SalesReportDto> {
    const bookings = await this.prisma.booking.findMany({
      where: { tenantId },
      select: {
        createdAt: true,
        totalAmount: true,
        package: { select: { title: true, destination: { select: { name: true } } } },
      },
    });

    const byMonth = new Map<string, { bookings: number; amount: number }>();
    const byDestination = new Map<string, { bookings: number; amount: number }>();
    const byPackage = new Map<string, { bookings: number; amount: number }>();
    let totalBookingValue = 0;

    for (const booking of bookings) {
      const amount = booking.totalAmount.toNumber();
      totalBookingValue += amount;

      const monthKey = booking.createdAt.toISOString().slice(0, 7);
      bump(byMonth, monthKey, amount);
      bump(byDestination, booking.package.destination.name, amount);
      bump(byPackage, booking.package.title, amount);
    }

    return {
      totalBookings: bookings.length,
      totalBookingValue,
      byMonth: [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({ month, ...v })),
      byDestination: [...byDestination.entries()].map(([label, v]) => ({ label, ...v })).sort((a, b) => b.amount - a.amount),
      byPackage: [...byPackage.entries()].map(([label, v]) => ({ label, ...v })).sort((a, b) => b.amount - a.amount),
    };
  }

  async getRevenueReport(tenantId: string): Promise<RevenueReportDto> {
    const [payments, refunds] = await Promise.all([
      this.prisma.payment.findMany({ where: { tenantId, status: "CAPTURED" }, select: { amount: true, method: true, capturedAt: true } }),
      this.prisma.refundRequest.findMany({
        where: { status: "PROCESSED", booking: { tenantId } },
        select: { amount: true, processedAt: true },
      }),
    ]);

    const byMonth = new Map<string, { captured: number; refunded: number }>();
    const byMethod = new Map<string, number>();
    let totalCaptured = 0;

    for (const payment of payments) {
      const amount = payment.amount.toNumber();
      totalCaptured += amount;
      const monthKey = (payment.capturedAt ?? new Date()).toISOString().slice(0, 7);
      const entry = byMonth.get(monthKey) ?? { captured: 0, refunded: 0 };
      entry.captured += amount;
      byMonth.set(monthKey, entry);
      byMethod.set(payment.method ?? "Unknown", (byMethod.get(payment.method ?? "Unknown") ?? 0) + amount);
    }

    let totalRefunded = 0;
    for (const refund of refunds) {
      const amount = refund.amount.toNumber();
      totalRefunded += amount;
      const monthKey = (refund.processedAt ?? new Date()).toISOString().slice(0, 7);
      const entry = byMonth.get(monthKey) ?? { captured: 0, refunded: 0 };
      entry.refunded += amount;
      byMonth.set(monthKey, entry);
    }

    return {
      totalCaptured,
      totalRefunded,
      netRevenue: totalCaptured - totalRefunded,
      byMonth: [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({ month, ...v })),
      byMethod: [...byMethod.entries()].map(([method, amount]) => ({ method, amount })).sort((a, b) => b.amount - a.amount),
    };
  }

  async getConsultantPerformance(tenantId: string): Promise<ConsultantPerformanceDto[]> {
    const consultants = await this.prisma.consultant.findMany({
      where: { adminUser: { tenantId } },
      include: { adminUser: { select: { id: true, name: true } } },
    });

    return Promise.all(
      consultants.map(async (consultant) => {
        const [leadsAssigned, leadsConverted, bookingsHandled, revenueAgg] = await Promise.all([
          this.prisma.lead.count({ where: { tenantId, assignedConsultantId: consultant.adminUserId } }),
          this.prisma.lead.count({ where: { tenantId, assignedConsultantId: consultant.adminUserId, status: "CONVERTED" } }),
          this.prisma.booking.count({ where: { tenantId, consultantId: consultant.adminUserId } }),
          this.prisma.booking.aggregate({ where: { tenantId, consultantId: consultant.adminUserId }, _sum: { totalAmount: true } }),
        ]);

        return {
          consultantId: consultant.adminUserId,
          consultantName: consultant.adminUser.name,
          leadsAssigned,
          leadsConverted,
          conversionRate: leadsAssigned > 0 ? Math.round((leadsConverted / leadsAssigned) * 1000) / 10 : 0,
          bookingsHandled,
          revenueGenerated: revenueAgg._sum.totalAmount?.toNumber() ?? 0,
        };
      }),
    );
  }

  async getMarketingReport(tenantId: string): Promise<MarketingReportDto> {
    const leads = await this.prisma.lead.findMany({ where: { tenantId }, select: { source: true, status: true } });

    const bySource = new Map<string, { total: number; converted: number }>();
    for (const lead of leads) {
      const key = lead.source ?? "Unknown";
      const entry = bySource.get(key) ?? { total: 0, converted: 0 };
      entry.total += 1;
      if (lead.status === "CONVERTED") entry.converted += 1;
      bySource.set(key, entry);
    }

    return {
      bySource: [...bySource.entries()]
        .map(([source, v]) => ({
          source,
          totalLeads: v.total,
          convertedLeads: v.converted,
          conversionRate: v.total > 0 ? Math.round((v.converted / v.total) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.totalLeads - a.totalLeads),
    };
  }

  async getSatisfactionReport(tenantId: string): Promise<SatisfactionReportDto> {
    const reviews = await this.prisma.review.findMany({ where: { tenantId, status: "APPROVED" }, select: { rating: true } });

    const distribution = [1, 2, 3, 4, 5].map((rating) => ({ rating, count: reviews.filter((r) => r.rating === rating).length }));
    const averageRating = reviews.length > 0 ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10 : 0;

    return { averageRating, totalReviews: reviews.length, distribution };
  }
}

function bump(map: Map<string, { bookings: number; amount: number }>, key: string, amount: number): void {
  const entry = map.get(key) ?? { bookings: 0, amount: 0 };
  entry.bookings += 1;
  entry.amount += amount;
  map.set(key, entry);
}
