import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { BookingDetailDto, CancellationRequestDto } from "@paxbook/types";
import { customerFetch, customerFetchOrNull, CustomerApiError } from "@/lib/customer-api";
import { BookingPaymentPanel } from "@/components/BookingPaymentPanel";
import { CancellationRequestButton } from "@/components/CancellationRequestButton";

export const metadata: Metadata = { title: "Trip details" };

const STATUS_LABEL: Record<string, string> = { DRAFT: "Awaiting payment", CONFIRMED: "Confirmed", COMPLETED: "Completed", CANCELLED: "Cancelled" };

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  let booking: BookingDetailDto;
  try {
    booking = await customerFetch<BookingDetailDto>(`/customer/bookings/${params.id}`);
  } catch (err) {
    if (err instanceof CustomerApiError && err.status === 404) notFound();
    throw err;
  }

  const cancellationRequests = await customerFetchOrNull<CancellationRequestDto[]>("/customer/bookings/cancellation-requests");
  const pendingCancellation = cancellationRequests?.find((r) => r.bookingId === booking.id && r.status === "REQUESTED");

  const outstanding = booking.paymentStatus === "PAID" ? 0 : booking.totalAmount;

  return (
    <div>
      <Link href="/account/bookings" className="text-sm font-medium text-slate-500 hover:text-brand">
        ← Back to my trips
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{booking.packageTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {STATUS_LABEL[booking.status] ?? booking.status} · Payment: {booking.paymentStatus}
          </p>
        </div>
        {booking.status === "CONFIRMED" || booking.status === "COMPLETED" ? (
          <div className="flex gap-2">
            <Link href={`/account/bookings/${booking.id}/voucher`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand">
              Travel voucher
            </Link>
            {booking.paymentStatus === "PAID" ? (
              <Link href={`/account/bookings/${booking.id}/invoice`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand">
                Download invoice
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900">Trip details</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-400">Travel start</dt>
                <dd className="text-slate-900">{booking.travelStartDate ? new Date(booking.travelStartDate).toLocaleDateString("en-IN") : "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Travel end</dt>
                <dd className="text-slate-900">{booking.travelEndDate ? new Date(booking.travelEndDate).toLocaleDateString("en-IN") : "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Consultant</dt>
                <dd className="text-slate-900">{booking.consultantName ?? "Not yet assigned"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Total amount</dt>
                <dd className="text-slate-900">
                  {booking.currency} {booking.totalAmount.toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900">Status history</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {booking.statusHistory.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    {h.fromStatus ?? "—"} → {h.toStatus}
                    {h.note ? <span className="text-slate-400"> · {h.note}</span> : null}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(h.changedAt).toLocaleString("en-IN")}</span>
                </li>
              ))}
            </ul>
          </section>

          {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" ? (
            <section>
              {pendingCancellation ? (
                <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">Your cancellation request is under review.</p>
              ) : (
                <CancellationRequestButton bookingId={booking.id} />
              )}
            </section>
          ) : null}
        </div>

        <aside>
          {outstanding > 0 && booking.status !== "CANCELLED" ? (
            <BookingPaymentPanel bookingId={booking.id} outstanding={outstanding} currency={booking.currency} />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
