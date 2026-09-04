import type { Metadata } from "next";
import { Suspense } from "react";
import { FlightFareSelector } from "@/components/FlightFareSelector";

export const metadata: Metadata = { title: "Choose Your Fare" };

export default function FlightFarePage() {
  return (
    <div className="shell py-8">
      <Suspense fallback={<div className="flat-card p-12 text-center text-slate-500">Loading…</div>}>
        <FlightFareSelector />
      </Suspense>
    </div>
  );
}
