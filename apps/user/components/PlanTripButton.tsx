"use client";

import * as React from "react";
import type { DestinationDto } from "@paxbook/types";
import { Modal } from "@/components/Modal";
import { TripPlanForm } from "@/components/TripPlanForm";

export function PlanTripButton({
  destinations,
  className,
  children,
}: {
  destinations: DestinationDto[];
  className: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Plan my trip"
        subtitle="Tell us the basics. A Paxbook expert drafts your itinerary and shares it within 24 hours."
        maxWidth="max-w-lg"
      >
        <TripPlanForm destinations={destinations} compact />
      </Modal>
    </>
  );
}
