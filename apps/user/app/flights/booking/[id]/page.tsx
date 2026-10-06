import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestBookingView } from "@/components/GuestBookingView";

export const metadata: Metadata = { title: "Your flight booking", robots: { index: false } };

/** A guest's booking, opened with the secret link from checkout (no login). */
export default function GuestBookingPage({ params }: { params: { id: string } }) {
  return (
    <div className="shell max-w-4xl py-10">
      <Suspense>
        <GuestBookingView kind="booking" id={params.id} />
      </Suspense>
    </div>
  );
}
