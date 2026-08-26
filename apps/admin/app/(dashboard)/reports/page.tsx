"use client";

import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useSalesReport,
  useRevenueReport,
  useConsultantPerformanceReport,
  useMarketingReport,
  useSatisfactionReport,
} from "@paxbook/api-client";
import type {
  BreakdownFigureDto,
  ConsultantPerformanceDto,
  MarketingSourceDto,
  RevenueByMethodDto,
} from "@paxbook/types";
import { Card, CardContent, CardHeader, CardTitle, DataTable, StatCard } from "@paxbook/ui";

export default function ReportsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.REPORTS_READ);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>reports.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Sales, revenue, consultant performance, marketing, and customer satisfaction.</p>
      </div>

      <SalesCard />
      <RevenueCard />
      <ConsultantCard />
      <MarketingCard />
      <SatisfactionCard />
    </div>
  );
}

function SalesCard() {
  const { data, isLoading } = useSalesReport();
  if (isLoading || !data) return <Card className="p-6 text-sm text-slate-400">Loading sales report…</Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Total bookings" value={data.totalBookings} />
          <StatCard label="Total booking value" value={`₹${data.totalBookingValue.toLocaleString("en-IN")}`} />
          <StatCard label="Avg. booking value" value={data.totalBookings > 0 ? `₹${Math.round(data.totalBookingValue / data.totalBookings).toLocaleString("en-IN")}` : "—"} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BreakdownTable title="By destination" rows={data.byDestination} />
          <BreakdownTable title="By package" rows={data.byPackage} />
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownTable({ title, rows }: { title: string; rows: BreakdownFigureDto[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{title}</p>
      <DataTable
        columns={[
          { header: "Name", cell: (r: BreakdownFigureDto) => r.label },
          { header: "Bookings", cell: (r: BreakdownFigureDto) => r.bookings },
          { header: "Value", cell: (r: BreakdownFigureDto) => `₹${r.amount.toLocaleString("en-IN")}` },
        ]}
        rows={rows}
        rowKey={(r) => r.label}
        emptyMessage="No data yet."
      />
    </div>
  );
}

function RevenueCard() {
  const { data, isLoading } = useRevenueReport();
  if (isLoading || !data) return <Card className="p-6 text-sm text-slate-400">Loading revenue report…</Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Captured" value={`₹${data.totalCaptured.toLocaleString("en-IN")}`} />
          <StatCard label="Refunded" value={`₹${data.totalRefunded.toLocaleString("en-IN")}`} />
          <StatCard label="Net revenue" value={`₹${data.netRevenue.toLocaleString("en-IN")}`} />
        </div>
        <DataTable
          columns={[
            { header: "Method", cell: (r: RevenueByMethodDto) => r.method },
            { header: "Amount", cell: (r: RevenueByMethodDto) => `₹${r.amount.toLocaleString("en-IN")}` },
          ]}
          rows={data.byMethod}
          rowKey={(r) => r.method}
          emptyMessage="No captured payments yet."
        />
      </CardContent>
    </Card>
  );
}

function ConsultantCard() {
  const { data, isLoading } = useConsultantPerformanceReport();
  if (isLoading || !data) return <Card className="p-6 text-sm text-slate-400">Loading consultant performance…</Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultant performance</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={[
            { header: "Consultant", cell: (c: ConsultantPerformanceDto) => c.consultantName },
            { header: "Leads assigned", cell: (c: ConsultantPerformanceDto) => c.leadsAssigned },
            { header: "Leads converted", cell: (c: ConsultantPerformanceDto) => c.leadsConverted },
            { header: "Conversion rate", cell: (c: ConsultantPerformanceDto) => `${c.conversionRate}%` },
            { header: "Bookings handled", cell: (c: ConsultantPerformanceDto) => c.bookingsHandled },
            { header: "Revenue generated", cell: (c: ConsultantPerformanceDto) => `₹${c.revenueGenerated.toLocaleString("en-IN")}` },
          ]}
          rows={data}
          rowKey={(c) => c.consultantId}
          emptyMessage="No consultants yet."
        />
      </CardContent>
    </Card>
  );
}

function MarketingCard() {
  const { data, isLoading } = useMarketingReport();
  if (isLoading || !data) return <Card className="p-6 text-sm text-slate-400">Loading marketing report…</Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing — leads by source</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={[
            { header: "Source", cell: (s: MarketingSourceDto) => s.source },
            { header: "Total leads", cell: (s: MarketingSourceDto) => s.totalLeads },
            { header: "Converted", cell: (s: MarketingSourceDto) => s.convertedLeads },
            { header: "Conversion rate", cell: (s: MarketingSourceDto) => `${s.conversionRate}%` },
          ]}
          rows={data.bySource}
          rowKey={(s) => s.source}
          emptyMessage="No leads yet."
        />
      </CardContent>
    </Card>
  );
}

function SatisfactionCard() {
  const { data, isLoading } = useSatisfactionReport();
  if (isLoading || !data) return <Card className="p-6 text-sm text-slate-400">Loading customer satisfaction…</Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer satisfaction</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Average rating" value={data.totalReviews > 0 ? `${data.averageRating} ★` : "—"} />
          <StatCard label="Approved reviews" value={data.totalReviews} />
        </div>
        <div className="flex flex-col gap-1">
          {data.distribution
            .slice()
            .reverse()
            .map((d) => (
              <div key={d.rating} className="flex items-center gap-2 text-sm">
                <span className="w-10 text-slate-500">{d.rating} ★</span>
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-slate-900"
                    style={{ width: data.totalReviews > 0 ? `${(d.count / data.totalReviews) * 100}%` : "0%" }}
                  />
                </div>
                <span className="w-8 text-right text-slate-500">{d.count}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
