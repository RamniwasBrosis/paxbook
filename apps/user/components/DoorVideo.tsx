"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";

const UNMUTE_EVENT = "paxbook:door-unmute";

/**
 * A destination card's video (admin upload). It plays muted while on screen and pauses off screen;
 * when the clip has an audio track, the speaker button turns the sound on (browsers block autoplay
 * with sound) and mutes any other card that was playing aloud. Reduced-motion visitors see the poster photo only.
 */
export function DoorVideo({
  src,
  poster,
  name,
}: {
  src: string;
  poster?: string | null;
  name: string;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = React.useState(true);
  const [hasAudio, setHasAudio] = React.useState(false);

  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) v.play().catch(() => undefined);
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    const onOther = (e: Event) => {
      if ((e as CustomEvent).detail !== v) {
        v.muted = true;
        setMuted(true);
      }
    };
    window.addEventListener(UNMUTE_EVENT, onOther);
    // Stock clips are often silent: offer the speaker only once the browser reports an audio track.
    const detect = () => {
      const m = v as HTMLVideoElement & {
        audioTracks?: { length: number };
        mozHasAudio?: boolean;
        webkitAudioDecodedByteCount?: number;
      };
      if (
        (m.audioTracks?.length ?? 0) > 0 ||
        m.mozHasAudio ||
        (m.webkitAudioDecodedByteCount ?? 0) > 0
      ) {
        setHasAudio(true);
        v.removeEventListener("timeupdate", detect);
      }
    };
    v.addEventListener("loadedmetadata", detect);
    v.addEventListener("timeupdate", detect);
    return () => {
      io.disconnect();
      window.removeEventListener(UNMUTE_EVENT, onOther);
      v.removeEventListener("loadedmetadata", detect);
      v.removeEventListener("timeupdate", detect);
    };
  }, [src]);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next) {
      window.dispatchEvent(new CustomEvent(UNMUTE_EVENT, { detail: v }));
      v.play().catch(() => undefined);
    }
  }

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`${name} video`}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {hasAudio ? (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={!muted}
          aria-label={
            muted ? `Play ${name} video with sound` : `Mute ${name} video`
          }
          className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-navy-deep/70 text-white backdrop-blur transition-colors hover:bg-accent hover:text-navy-deep"
        >
          {muted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
      ) : null}
    </>
  );
}
