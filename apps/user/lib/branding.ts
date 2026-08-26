import type { PublicBrandingDto } from "@paxbook/types";
import { publicFetch } from "./api";

const FALLBACK: PublicBrandingDto = {
  siteName: "Paxbook",
  logoUrl: null,
  primaryColor: null,
  templateSlug: "classic",
  googleLoginEnabled: false,
  ga4MeasurementId: null,
  facebookPixelId: null,
  googleMapsApiKey: null,
};

/** Next dedupes identical fetches within a single request, so calling this from both the root layout and a page is one network call. */
export async function getBranding(): Promise<PublicBrandingDto> {
  try {
    return await publicFetch<PublicBrandingDto>("/public/branding");
  } catch {
    return FALLBACK;
  }
}
