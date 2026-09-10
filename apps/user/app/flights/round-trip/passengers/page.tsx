import type { Metadata } from "next";
import { readSession } from "@/lib/session";
import { RoundTripBookingWizard } from "@/components/RoundTripBookingWizard";

export const metadata: Metadata = { title: "Passenger Details" };

export default function RoundTripPassengersPage() {
  const session = readSession();
  return (
    <div className="shell py-8">
      <RoundTripBookingWizard isLoggedIn={Boolean(session)} />
    </div>
  );
}
