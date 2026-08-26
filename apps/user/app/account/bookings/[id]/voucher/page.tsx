import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { BookingVoucherViewDto } from "@paxbook/types";
import { customerFetch, CustomerApiError } from "@/lib/customer-api";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = { title: "Travel Voucher" };

export default async function VoucherPage({ params }: { params: { id: string } }) {
  let voucher: BookingVoucherViewDto;
  try {
    voucher = await customerFetch<BookingVoucherViewDto>(`/customer/bookings/${params.id}/voucher`);
  } catch (err) {
    if (err instanceof CustomerApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 print:py-0">
      <div className="rounded-2xl border border-slate-200 p-8 print:border-none">
        <div className="border-b border-slate-100 pb-6">
          <p className="text-xl font-bold text-brand">Paxbook</p>
          <p className="text-xs text-slate-400">Travel Voucher</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Traveler</p>
            <p className="font-medium text-slate-900">{voucher.customerName}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Package</p>
            <p className="font-medium text-slate-900">{voucher.packageTitle}</p>
          </div>
          <div>
            <p className="text-slate-400">Travel start</p>
            <p className="font-medium text-slate-900">{voucher.travelStartDate ? new Date(voucher.travelStartDate).toLocaleDateString("en-IN") : "TBD"}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Travel end</p>
            <p className="font-medium text-slate-900">{voucher.travelEndDate ? new Date(voucher.travelEndDate).toLocaleDateString("en-IN") : "TBD"}</p>
          </div>
        </div>

        {voucher.travelers.length > 0 ? (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-900">Travelers</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
              {voucher.travelers.map((t, i) => (
                <li key={i}>
                  {t.name} {t.passportNumber ? `· Passport ${t.passportNumber}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {voucher.fileUrl ? (
          <a href={voucher.fileUrl} className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">
            Download attached PDF
          </a>
        ) : null}

        <p className="mt-6 text-xs text-slate-400">Generated {new Date(voucher.generatedAt).toLocaleString("en-IN")}</p>

        <PrintButton label="Print / Save as PDF" />
      </div>
    </div>
  );
}
