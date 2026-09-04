import type { Metadata } from "next";
import { Suspense } from "react";
import { readSession } from "@/lib/session";
import { FlightBookingWizard } from "@/components/FlightBookingWizard";

export const metadata: Metadata = { title: "Passenger Details" };

export default function FlightPassengersPage() {
  const session = readSession();
  return (
    <div className="shell py-8">
      <Suspense fallback={<div className="flat-card p-12 text-center text-slate-500">Loading…</div>}>
        <FlightBookingWizard isLoggedIn={Boolean(session)} />
      </Suspense>
    </div>
  );
}
