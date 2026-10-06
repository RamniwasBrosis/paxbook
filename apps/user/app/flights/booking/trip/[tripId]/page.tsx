import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestBookingView } from "@/components/GuestBookingView";

export const metadata: Metadata = { title: "Your round trip booking", robots: { index: false } };

/** A guest's round trip, opened with the secret link from checkout (no login). */
export default function GuestTripPage({ params }: { params: { tripId: string } }) {
  return (
    <div className="shell max-w-4xl py-10">
      <Suspense>
        <GuestBookingView kind="trip" id={params.tripId} />
      </Suspense>
    </div>
  );
}
