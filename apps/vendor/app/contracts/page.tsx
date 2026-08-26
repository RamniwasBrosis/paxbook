import type { Metadata } from "next";
import type { VendorContractDto } from "@paxbook/types";
import { vendorFetch } from "@/lib/vendor-api";
import { UploadContractDocument } from "@/components/UploadContractDocument";

export const metadata: Metadata = { title: "Contracts" };

export default async function ContractsPage() {
  const contracts = await vendorFetch<VendorContractDto[]>("/vendor/contracts");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
      <p className="mt-1 text-sm text-slate-500">
        Terms, commission rates, and dates are set by Paxbook — you can attach or update the signed document for each contract.
      </p>

      {contracts.length === 0 ? (
        <p className="mt-6 rounded-xl bg-white p-6 text-sm text-slate-500">No contracts on file yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {contracts.map((c) => (
            <div key={c.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {c.startDate.slice(0, 10)} {c.endDate ? `→ ${c.endDate.slice(0, 10)}` : "(ongoing)"}
                </p>
                {c.commissionRate != null ? <p className="text-sm text-slate-500">{c.commissionRate}% commission</p> : null}
                {c.terms ? <p className="mt-1 text-sm text-slate-500">{c.terms}</p> : null}
              </div>
              <div className="flex items-center gap-4">
                {c.fileUrl ? (
                  <a href={c.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand hover:underline">
                    View document
                  </a>
                ) : (
                  <span className="text-sm text-slate-400">No document</span>
                )}
                <UploadContractDocument contractId={c.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
