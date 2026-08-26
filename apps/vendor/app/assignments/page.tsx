import type { Metadata } from "next";
import type { VendorAssignmentDto } from "@paxbook/types";
import { vendorFetch } from "@/lib/vendor-api";

export const metadata: Metadata = { title: "Assignments" };

export default async function AssignmentsPage() {
  const assignments = await vendorFetch<VendorAssignmentDto[]>("/vendor/assignments");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Trip Assignments</h1>
      <p className="mt-1 text-sm text-slate-500">Packages and itinerary days where you&apos;re the assigned vendor.</p>

      {assignments.length === 0 ? (
        <p className="mt-6 rounded-xl bg-white p-6 text-sm text-slate-500">No assignments yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {assignments.map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="font-semibold text-slate-900">{a.packageTitle}</p>
                <p className="text-sm text-slate-500">
                  {a.destinationName} · {a.detail}
                </p>
              </div>
              <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">{a.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
