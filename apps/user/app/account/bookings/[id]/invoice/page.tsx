import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { BookingInvoiceViewDto } from "@paxbook/types";
import { customerFetch, CustomerApiError } from "@/lib/customer-api";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = { title: "Invoice" };

export default async function InvoicePage({ params }: { params: { id: string } }) {
  let invoice: BookingInvoiceViewDto;
  try {
    invoice = await customerFetch<BookingInvoiceViewDto>(`/customer/bookings/${params.id}/invoice`);
  } catch (err) {
    if (err instanceof CustomerApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 print:py-0">
      <div className="rounded-2xl border border-slate-200 p-8 print:border-none">
        <div className="flex items-baseline justify-between border-b border-slate-100 pb-6">
          <div>
            <p className="text-xl font-bold text-brand">Paxbook</p>
            <p className="text-xs text-slate-400">Tax Invoice</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-slate-900">{invoice.invoiceNumber}</p>
            <p className="text-slate-400">{new Date(invoice.issuedAt).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Billed to</p>
            <p className="font-medium text-slate-900">{invoice.customerName}</p>
            <p className="text-slate-500">{invoice.customerEmail}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Package</p>
            <p className="font-medium text-slate-900">{invoice.packageTitle}</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <p className="font-semibold text-slate-900">Total paid</p>
          <p className="text-2xl font-bold text-slate-900">
            {invoice.currency} {invoice.amount.toLocaleString("en-IN")}
          </p>
        </div>

        {invoice.fileUrl ? (
          <a href={invoice.fileUrl} className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
            Download attached PDF
          </a>
        ) : null}

        <PrintButton label="Print / Save as PDF" />
      </div>
    </div>
  );
}
