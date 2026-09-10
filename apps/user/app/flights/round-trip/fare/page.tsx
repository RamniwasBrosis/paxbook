import type { Metadata } from "next";
import { RoundTripFareSelector } from "@/components/RoundTripFareSelector";

export const metadata: Metadata = { title: "Choose Your Fares" };

export default function RoundTripFarePage() {
  return (
    <div className="shell py-8">
      <RoundTripFareSelector />
    </div>
  );
}
