import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { FlightTicketDto } from "@paxbook/types";
import { customerFetch, CustomerApiError } from "@/lib/customer-api";
import { ETicketView } from "@/components/ETicketView";

export const metadata: Metadata = { title: "E-Ticket" };

export default async function FlightTicketPage({ params }: { params: { id: string } }) {
  let ticket: FlightTicketDto;
  try {
    ticket = await customerFetch<FlightTicketDto>(`/customer/flight-bookings/${params.id}/ticket`);
  } catch (err) {
    if (err instanceof CustomerApiError && err.status === 404) notFound();
    throw err;
  }
  return (
    <div className="px-4 py-8 print:p-0">
      <ETicketView ticket={ticket} pdfHref={`/api/customer/flight-bookings/${params.id}/ticket.pdf`} />
    </div>
  );
}
