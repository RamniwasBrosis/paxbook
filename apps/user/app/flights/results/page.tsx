import type { Metadata } from "next";
import { Suspense } from "react";
import { FlightResultsList } from "@/components/FlightResultsList";

export const metadata: Metadata = { title: "Flight Results" };

export default function FlightResultsPage() {
  return (
    <div className="shell py-8">
      <Suspense fallback={<div className="flat-card p-12 text-center text-slate-500">Loading…</div>}>
        <FlightResultsList />
      </Suspense>
    </div>
  );
}
