"use client";

import { useMemo } from "react";
import {
  useSession,
  useAdminUsers,
  useRoles,
  useAuditLog,
  useBookings,
  useSalesReport,
  useRevenueReport,
  useMarketingReport,
  useSatisfactionReport,
} from "@paxbook/api-client";
import type { BookingStatus } from "@paxbook/types";
import { Card, CardContent, CardHeader, CardTitle, StatCard } from "@paxbook/ui";
import { HorizontalBarChart, ChartLegend } from "@/components/charts/HorizontalBarChart";

const STATUS_COLOR: Record<BookingStatus, string> = {
  DRAFT: "#2a78d6",
  CONFIRMED: "#1baf7a",
  COMPLETED: "#008300",
  CANCELLED: "#e34948",
};
const STATUS_LABEL: Record<BookingStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function DashboardHomePage() {
  const { admin } = useSession();
  const usersQuery = useAdminUsers();
  const rolesQuery = useRoles();
  const auditQuery = useAuditLog(1, 5);
  const bookingsQuery = useBookings();
  const salesQuery = useSalesReport();
  const revenueQuery = useRevenueReport();
  const marketingQuery = useMarketingReport();
  const satisfactionQuery = useSatisfactionReport();

  const statusBreakdown = useMemo(() => {
    const bookings = bookingsQuery.data ?? [];
    const tally = new Map<BookingStatus, number>();
    for (const b of bookings) tally.set(b.status, (tally.get(b.status) ?? 0) + 1);
    return (Object.keys(STATUS_LABEL) as BookingStatus[])
      .map((status) => ({ label: STATUS_LABEL[status], value: tally.get(status) ?? 0, color: STATUS_COLOR[status] }))
      .filter((row) => row.value > 0);
  }, [bookingsQuery.data]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Welcome back, {admin?.name}</h1>
        <p className="text-sm text-slate-500">Here&apos;s how the platform is doing right now.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Admin users" value={usersQuery.data?.length ?? "…"} />
        <StatCard label="Roles configured" value={rolesQuery.data?.length ?? "…"} />
        <StatCard label="Total bookings" value={salesQuery.data?.totalBookings ?? "…"} />
        <StatCard
          label="Net revenue"
          value={revenueQuery.data ? `₹${revenueQuery.data.netRevenue.toLocaleString("en-IN")}` : "…"}
        />
        <StatCard
          label="Avg. rating"
          value={satisfactionQuery.data?.totalReviews ? `${satisfactionQuery.data.averageRating} ★` : "—"}
        />
        <StatCard
          label="Audit log entries"
          value={auditQuery.data?.meta.total ?? "…"}
          hint="Every mutating admin action is recorded automatically"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bookings by status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {bookingsQuery.isLoading ? (
              <p className="py-6 text-center text-sm text-slate-400">Loading…</p>
            ) : (
              <>
                <HorizontalBarChart items={statusBreakdown} emptyMessage="No bookings yet." />
                {statusBreakdown.length > 0 ? (
                  <ChartLegend items={statusBreakdown.map((s) => ({ label: s.label, color: s.color! }))} />
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top destinations by sales value</CardTitle>
          </CardHeader>
          <CardContent>
            {salesQuery.isLoading || !salesQuery.data ? (
              <p className="py-6 text-center text-sm text-slate-400">Loading…</p>
            ) : (
              <HorizontalBarChart
                items={salesQuery.data.byDestination.slice(0, 6).map((d) => ({ label: d.label, value: d.amount }))}
                valueFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                emptyMessage="No sales recorded yet."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads by source</CardTitle>
          </CardHeader>
          <CardContent>
            {marketingQuery.isLoading || !marketingQuery.data ? (
              <p className="py-6 text-center text-sm text-slate-400">Loading…</p>
            ) : (
              <HorizontalBarChart
                items={marketingQuery.data.bySource.map((s) => ({ label: s.source, value: s.totalLeads }))}
                emptyMessage="No leads captured yet."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer rating distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {satisfactionQuery.isLoading || !satisfactionQuery.data ? (
              <p className="py-6 text-center text-sm text-slate-400">Loading…</p>
            ) : (
              <HorizontalBarChart
                items={satisfactionQuery.data.distribution
                  .slice()
                  .reverse()
                  .map((d) => ({ label: `${d.rating} ★`, value: d.count }))}
                emptyMessage="No reviews yet."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
