"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLeads } from "@paxbook/api-client";
import type { LeadStatus, LeadSummaryDto } from "@paxbook/types";
import { Badge, DataTable, Input, Select } from "@paxbook/ui";

const SOURCE = "Trip Customizer";
const LEAD_STATUS_TONE = { NEW: "info", CONTACTED: "warning", QUALIFIED: "warning", CONVERTED: "success", LOST: "danger" } as const;
const STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

/**
 * Every enquiry submitted through the website's "customize your trip" wizard, with all of the
 * customer's choices in one table. Rows open the full lead (status, consultant, follow-ups).
 */
export default function TripEnquiriesPage() {
  const router = useRouter();
  const leadsQuery = useLeads();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");

  const enquiries = (leadsQuery.data ?? [])
    .filter((l) => l.source === SOURCE)
    .filter((l) => !status || l.status === status)
    .filter((l) => {
      const q = search.trim().toLowerCase();
      return !q || [l.name, l.email, l.phone, l.destinationInterest, l.departureCity].some((v) => v?.toLowerCase().includes(q));
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const newCount = (leadsQuery.data ?? []).filter((l) => l.source === SOURCE && l.status === "NEW").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Trip Enquiries</h1>
          <p className="text-sm text-slate-500">
            Requests from the website trip customizer{newCount ? ` · ${newCount} new` : ""}. Click a row to update status, assign a consultant or add follow-ups.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Input label="Search" placeholder="Name, email, mobile, destination" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <DataTable
          columns={[
            { header: "Received", cell: (l: LeadSummaryDto) => <span className="whitespace-nowrap">{day(l.createdAt)}</span> },
            {
              header: "Customer",
              cell: (l: LeadSummaryDto) => (
                <span className="flex flex-col">
                  <span className="font-medium text-slate-900">{l.name}</span>
                  <span className="text-xs text-slate-500">{l.email ?? "—"}</span>
                  <span className="text-xs text-slate-500">{l.phone ?? "—"}</span>
                </span>
              ),
            },
            { header: "Destination", cell: (l: LeadSummaryDto) => l.destinationInterest ?? "—" },
            {
              header: "Travellers",
              cell: (l: LeadSummaryDto) => [l.travellerType, l.travellerCount ? `${l.travellerCount} pax` : null].filter(Boolean).join(" · ") || "—",
            },
            { header: "Duration", cell: (l: LeadSummaryDto) => <span className="whitespace-nowrap">{l.tripDuration ?? "—"}</span> },
            { header: "Stay / Pace", cell: (l: LeadSummaryDto) => [l.stayType, l.travelPace].filter(Boolean).join(" · ") || "—" },
            { header: "From", cell: (l: LeadSummaryDto) => l.departureCity ?? "—" },
            { header: "Departure", cell: (l: LeadSummaryDto) => <span className="whitespace-nowrap">{day(l.departureDate)}</span> },
            { header: "Interests", cell: (l: LeadSummaryDto) => <span className="text-xs">{l.interests.join(", ") || "—"}</span> },
            { header: "Status", cell: (l: LeadSummaryDto) => <Badge tone={LEAD_STATUS_TONE[l.status]}>{l.status}</Badge> },
          ]}
          rows={enquiries}
          rowKey={(l) => l.id}
          onRowClick={(l) => router.push(`/crm/leads/${l.id}`)}
          isLoading={leadsQuery.isLoading}
          emptyMessage="No trip enquiries yet."
        />
      </div>
    </div>
  );
}
