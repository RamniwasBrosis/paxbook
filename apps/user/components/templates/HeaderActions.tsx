"use client";

import * as React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";
import { Modal } from "@/components/Modal";
import { LoginForm } from "@/components/LoginForm";
import { TripPlanForm } from "@/components/TripPlanForm";

export function HeaderActions({
  destinations,
  session,
  planTripButtonClassName,
  loginButtonClassName,
  googleEnabled,
}: {
  destinations: DestinationDto[];
  session: { name: string } | null;
  planTripButtonClassName: string;
  loginButtonClassName: string;
  googleEnabled?: boolean;
}) {
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [planOpen, setPlanOpen] = React.useState(false);

  return (
    <>
      <button type="button" onClick={() => setPlanOpen(true)} className={planTripButtonClassName}>
        Plan My Trip
      </button>

      {session ? (
        <Link href="/account" aria-label={`Hi, ${session.name.split(" ")[0]}`} className={loginButtonClassName}>
          <User className="h-5 w-5" strokeWidth={2} />
        </Link>
      ) : (
        <button type="button" aria-label="Login" onClick={() => setLoginOpen(true)} className={loginButtonClassName}>
          <User className="h-5 w-5" strokeWidth={2} />
        </button>
      )}

      <Modal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        title="Welcome to Paxbook"
        subtitle="Log in to unlock prices, save itineraries and track your bookings."
      >
        <LoginForm nextPath="/account" embedded googleEnabled={googleEnabled} />
      </Modal>

      <Modal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        title="Plan my trip"
        subtitle="Tell us the basics. A Paxbook expert drafts your itinerary and shares it within 24 hours."
        maxWidth="max-w-lg"
      >
        <TripPlanForm destinations={destinations} compact />
      </Modal>
    </>
  );
}
