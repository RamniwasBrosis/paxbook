"use client";

import * as React from "react";
import { Plane } from "lucide-react";

/** Always fetch a source at least as big as the largest size we render (40px) so the logo never
 * looks soft/blurry on a retina display — the CDN only offers a few fixed buckets. */
function sourceBucket(displaySize: number): "32x32" | "64x64" | "128x128" {
  if (displaySize > 64) return "128x128";
  if (displaySize > 24) return "64x64";
  return "32x32";
}

/** Real airline logo — square brand tile (matches how every major OTA shows it), via a public
 * airline-logo CDN keyed by IATA code. Falls back to a plain plane badge only on a network/load
 * failure; the CDN itself already returns a generic square icon for a code it doesn't recognize. */
export function AirlineLogo({ code, size = 28, className = "" }: { code?: string | null; size?: number; className?: string }) {
  const [failed, setFailed] = React.useState(false);
  const normalized = code?.trim().toUpperCase();

  if (!normalized || failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-mist text-brand ${className}`}
        style={{ width: size, height: size }}
      >
        <Plane className="h-1/2 w-1/2" strokeWidth={1.75} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://images.kiwi.com/airlines/${sourceBucket(size)}/${normalized}.png`}
      alt={`${normalized} logo`}
      width={size}
      height={size}
      className={`shrink-0 rounded-lg object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
