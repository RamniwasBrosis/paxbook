import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { DestinationDto, VisaInfoDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Visa Guide" };

export default async function VisaGuidePage() {
  const [countries, destinations] = await Promise.all([
    publicFetch<VisaInfoDto[]>("/public/visa-guide"),
    publicFetch<DestinationDto[]>("/public/destinations"),
  ]);

  const imageByCountryId = new Map<string, string>();
  for (const d of destinations) {
    if (d.heroImageUrl && !imageByCountryId.has(d.countryId)) imageByCountryId.set(d.countryId, d.heroImageUrl);
  }

  return (
    <div>
      <PageHero
        breadcrumbs={[{ label: "Visa Guide" }]}
        eyebrow="Country-wise"
        title="Visa Guide"
        subtitle="Indicative requirements for the destinations we book most. Rules change often — our team reconfirms every requirement before your trip."
      />

      <div className="shell py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-0.5 w-8 rounded-full bg-accent" />
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue">Country-wise</p>
            </div>
            <h2 className="font-display text-2xl font-bold text-navy-deep sm:text-3xl">Visa requirements at a glance</h2>
          </div>
        </div>

        {countries.length === 0 ? (
          <p className="text-slate-500">Visa information isn&apos;t available yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((c) => {
              const image = imageByCountryId.get(c.countryId);
              return (
                <div key={c.countryId} className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="relative h-36 overflow-hidden">
                    {image ? (
                      <img src={image} alt={c.countryName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-brand to-brand-dark" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base text-navy-deep">{c.countryName}</h3>
                      {c.isVisaFree ? (
                        <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[0.65rem] font-bold text-accent-dark">Visa-free</span>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Visa type</span>
                        <span className="font-medium text-slate-700">{c.visaType ?? "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Processing</span>
                        <span className="font-medium text-slate-700">{c.processingTime ?? "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fees</span>
                        <span className="font-medium text-slate-700">{c.visaFee != null ? `${c.currency} ${c.visaFee}` : "Shared with your quote"}</span>
                      </div>
                    </div>
                    {c.requiredDocuments.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Documents</p>
                        <ul className="mt-1.5 flex flex-col gap-1">
                          {c.requiredDocuments.map((doc) => (
                            <li key={doc} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={2} />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <Link
                      href="/contact"
                      className="mt-auto rounded-full bg-accent px-4 py-2 text-center text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
                    >
                      Get Visa Assistance
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
