"use client";

import * as React from "react";
import { Plane } from "lucide-react";

/** Real airline logo via a public airline-logo CDN keyed by IATA code — falls back to a plain
 * plane badge if the image fails to load (e.g. a code the CDN doesn't recognize). */
export function AirlineLogo({ code, size = 28, className = "" }: { code?: string | null; size?: number; className?: string }) {
  const [failed, setFailed] = React.useState(false);
  const normalized = code?.trim().toUpperCase();

  if (!normalized || failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-mist text-brand ${className}`}
        style={{ width: size, height: size }}
      >
        <Plane className="h-1/2 w-1/2" strokeWidth={1.75} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://pics.avs.io/${size}/${size}/${normalized}.png`}
      alt={`${normalized} logo`}
      width={size}
      height={size}
      className={`shrink-0 rounded-full border border-slate-100 bg-white object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
