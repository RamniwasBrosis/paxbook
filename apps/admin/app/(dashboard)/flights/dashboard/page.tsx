"use client";

import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useFlightDashboard } from "@paxbook/api-client";
import type { FlightDashboardBreakdownDto, FlightDashboardStatusCountDto } from "@paxbook/types";
import { Card, CardContent, CardHeader, CardTitle, DataTable, StatCard } from "@paxbook/ui";

export default function FlightDashboardPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.FLIGHTS_READ);
  const { data, isLoading } = useFlightDashboard();

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your role doesn&apos;t include <code>flights.read</code>.
        </p>
      </Card>
    );
  }

  if (isLoading || !data) {
    return <p className="text-sm text-slate-500">Loading flight dashboard…</p>;
  }

  const maxDaily = Math.max(1, ...data.dailyLast30Days.map((d) => d.revenue));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/flights" className="text-xs text-slate-500 hover:underline">
            ← All flight bookings
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">Flight dashboard</h1>
          <p className="text-sm text-slate-500">Revenue, cost, and profit — computed from real bookings, not estimates.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total bookings" value={data.totalBookings} />
        <StatCard label="Confirmed" value={data.confirmedBookings} />
        <StatCard label="Pending" value={data.pendingBookings} />
        <StatCard label="Cancelled" value={data.cancelledBookings} />
        <StatCard label="Failed" value={data.failedBookings} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Revenue" value={`₹${data.revenue.toLocaleString("en-IN")}`} hint="Customer payments collected" />
        <StatCard label="Supplier cost" value={`₹${data.supplierCost.toLocaleString("en-IN")}`} hint="The provider's real fares" />
        <StatCard label="Gross margin" value={`₹${data.margin.toLocaleString("en-IN")}`} hint="Revenue − supplier cost" />
        <StatCard label="Refunded" value={`₹${data.refunded.toLocaleString("en-IN")}`} hint="Paid back to customers" />
        <StatCard label="Net profit" value={`₹${data.netProfit.toLocaleString("en-IN")}`} hint="Margin − refunds" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings, last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-end gap-1">
            {data.dailyLast30Days.map((d) => (
              <div key={d.date} className="group relative flex-1" title={`${d.date}: ${d.bookings} booking(s), ₹${d.revenue.toLocaleString("en-IN")}`}>
                <div
                  className="w-full rounded-t bg-brand/70 transition-colors group-hover:bg-brand"
                  style={{ height: `${Math.max(2, (d.revenue / maxDaily) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-400">
            <span>{data.dailyLast30Days[0]?.date}</span>
            <span>{data.dailyLast30Days[data.dailyLast30Days.length - 1]?.date}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bookings by status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBars rows={data.byStatus} total={data.totalBookings} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bookings by payment status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBars rows={data.byPaymentStatus} total={data.totalBookings} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top routes</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownTable rows={data.topRoutes} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top airlines</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownTable rows={data.topAirlines} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBars({ rows, total }: { rows: FlightDashboardStatusCountDto[]; total: number }) {
  if (rows.length === 0) return <p className="text-sm text-slate-400">No bookings yet.</p>;
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.status} className="flex items-center gap-2 text-sm">
          <span className="w-40 shrink-0 truncate text-slate-500">{r.status.replace(/_/g, " ")}</span>
          <div className="h-2 flex-1 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-slate-900" style={{ width: total > 0 ? `${(r.count / total) * 100}%` : "0%" }} />
          </div>
          <span className="w-8 text-right text-slate-500">{r.count}</span>
        </div>
      ))}
    </div>
  );
}

function BreakdownTable({ rows }: { rows: FlightDashboardBreakdownDto[] }) {
  return (
    <DataTable
      columns={[
        { header: "Name", cell: (r: FlightDashboardBreakdownDto) => r.label },
        { header: "Bookings", cell: (r: FlightDashboardBreakdownDto) => r.bookings },
        { header: "Revenue", cell: (r: FlightDashboardBreakdownDto) => `₹${r.revenue.toLocaleString("en-IN")}` },
      ]}
      rows={rows}
      rowKey={(r) => r.label}
      emptyMessage="No paid bookings yet."
    />
  );
}
