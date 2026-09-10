import type { Metadata } from "next";
import { Suspense } from "react";
import { RoundTripResultsList } from "@/components/RoundTripResultsList";

export const metadata: Metadata = { title: "Round Trip Flight Results" };

export default function RoundTripResultsPage() {
  return (
    <div className="shell py-8">
      <Suspense fallback={<div className="flat-card p-12 text-center text-slate-500">Loading…</div>}>
        <RoundTripResultsList />
      </Suspense>
    </div>
  );
}
