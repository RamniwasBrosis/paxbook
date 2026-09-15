"use client";

import * as React from "react";
import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useAdminFlightStatement } from "@paxbook/api-client";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@paxbook/ui";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function FlightStatementPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.FLIGHTS_READ);
  const [date, setDate] = React.useState(todayIso());
  const [forceRefresh, setForceRefresh] = React.useState(false);
  const statementQuery = useAdminFlightStatement(date, { refresh: forceRefresh, enabled: canRead });

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

  const entries = statementQuery.data?.entries ?? [];
  const totals = entries.reduce(
    (acc, e) => ({ debit: acc.debit + e.debit, credit: acc.credit + e.credit }),
    { debit: 0, credit: 0 },
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/flights" className="text-xs text-slate-500 hover:underline">
          ← All flight bookings
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">FTD statement</h1>
        <p className="text-sm text-slate-500">
          The real daily transaction ledger from FTD — every booking, refund, commission, markup, and fee that touched your agency&apos;s FTD wallet
          balance. Fetched once per date and cached; use Refresh to re-pull today&apos;s ledger as it grows.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 py-4">
          <Input
            label="Date"
            type="date"
            max={todayIso()}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setForceRefresh(false);
            }}
            className="max-w-xs"
          />
          <Button
            variant="secondary"
            onClick={() => {
              setForceRefresh(true);
              statementQuery.refetch();
            }}
            isLoading={statementQuery.isFetching}
          >
            Refresh from FTD
          </Button>
          {statementQuery.data ? (
            <p className="text-xs text-slate-400">
              {statementQuery.data.fromCache ? "Cached" : "Freshly fetched"} at {new Date(statementQuery.data.fetchedAt).toLocaleString("en-IN")}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{entries.length} transaction{entries.length === 1 ? "" : "s"} on {date}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-2 font-medium">Time</th>
                <th className="px-5 py-2 font-medium">Type</th>
                <th className="px-5 py-2 font-medium">Reference</th>
                <th className="px-5 py-2 font-medium text-right">Debit</th>
                <th className="px-5 py-2 font-medium text-right">Credit</th>
                <th className="px-5 py-2 font-medium text-right">Commission</th>
                <th className="px-5 py-2 font-medium text-right">Markup</th>
                <th className="px-5 py-2 font-medium text-right">TDS</th>
                <th className="px-5 py-2 font-medium text-right">Balance</th>
                <th className="px-5 py-2 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.sNo} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 whitespace-nowrap text-slate-500">{e.valueDate}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">{e.transactionType}</td>
                  <td className="px-5 py-3 text-slate-500">{e.transactionRef}</td>
                  <td className="px-5 py-3 text-right text-red-600">{e.debit ? `₹${e.debit.toLocaleString("en-IN")}` : "—"}</td>
                  <td className="px-5 py-3 text-right text-emerald-600">{e.credit ? `₹${e.credit.toLocaleString("en-IN")}` : "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{e.commission ? `₹${e.commission.toLocaleString("en-IN")}` : "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{e.markup ? `₹${e.markup.toLocaleString("en-IN")}` : "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{e.tds ? `₹${e.tds.toLocaleString("en-IN")}` : "—"}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-900">₹{e.bookingBalance.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-slate-500">{e.remarks || "—"}</td>
                </tr>
              ))}
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-6 text-center text-slate-400">
                    {statementQuery.isLoading ? "Loading…" : "No transactions on this date."}
                  </td>
                </tr>
              ) : (
                <tr className="bg-mist font-semibold text-slate-900">
                  <td className="px-5 py-3" colSpan={3}>
                    Totals
                  </td>
                  <td className="px-5 py-3 text-right text-red-600">₹{totals.debit.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-right text-emerald-600">₹{totals.credit.toLocaleString("en-IN")}</td>
                  <td colSpan={5} />
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
