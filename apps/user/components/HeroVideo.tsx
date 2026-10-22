"use client";

import * as React from "react";

/**
 * The homepage hero video: muted, looping, autoplay (browsers allow autoplay only when muted), with
 * the photo as poster while it loads. Visitors who prefer reduced motion get the still photo.
 */
export function HeroVideo({ src, poster }: { src: string; poster?: string | null }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    v.play().catch(() => undefined);
  }, [src]);
  return (
    <video ref={ref} src={src} poster={poster ?? undefined} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" className="h-full w-full object-cover" />
  );
}
