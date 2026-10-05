"use client";

import * as React from "react";
import { ShieldAlert } from "lucide-react";
import type { FlightImportantInfoSectionDto } from "@paxbook/types";
import { getClientTenantHeader } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/** The admin-managed "Important information" block on the flight booking page. */
export function FlightImportantInfo() {
  const [sections, setSections] = React.useState<FlightImportantInfoSectionDto[] | null>(null);

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/public/flights/important-info`, { headers: getClientTenantHeader() })
      .then((res) => res.json())
      .then((json) => setSections(json.success ? (json.data as FlightImportantInfoSectionDto[]) : []))
      .catch(() => setSections([]));
  }, []);

  if (!sections || sections.length === 0) return null;

  return (
    <section aria-labelledby="important-info-title" className="flat-card p-5 sm:p-6">
      <h2 id="important-info-title" className="font-display text-xl font-extrabold text-navy-deep">
        Important information
      </h2>
      <div className="mt-4 flex flex-col gap-5">
        {sections.map((s, i) => (
          <div key={i}>
            <h3 className="flex items-center gap-2.5 font-bold text-navy-deep">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-red-50">
                <ShieldAlert className="h-4 w-4 text-red-500" strokeWidth={2.25} />
              </span>
              {s.title}
            </h3>
            {s.points.length > 0 ? (
              <ul className="ml-[2.35rem] mt-2 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-ink-muted marker:text-slate-300">
                {s.points.map((p, j) => (
                  <li key={j}>{p}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
