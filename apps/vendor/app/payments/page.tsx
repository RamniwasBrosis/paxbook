import type { Metadata } from "next";
import type { VendorPaymentDto } from "@paxbook/types";
import { vendorFetch } from "@/lib/vendor-api";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const payments = await vendorFetch<VendorPaymentDto[]>("/vendor/payments");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
      <p className="mt-1 text-sm text-slate-500">Payments recorded against your bookings.</p>

      {payments.length === 0 ? (
        <p className="mt-6 rounded-xl bg-white p-6 text-sm text-slate-500">No payments recorded yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="font-semibold text-slate-900">₹{p.amount.toLocaleString("en-IN")}</p>
                {p.paidAt ? <p className="text-xs text-slate-400">Paid {new Date(p.paidAt).toLocaleDateString("en-IN")}</p> : null}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  p.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
