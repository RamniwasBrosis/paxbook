import type { DestinationDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";
import { getBranding } from "@/lib/branding";
import { ClassicHeader } from "./templates/classic/Header";
import { ModernHeader } from "./templates/modern/Header";

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    return await publicFetch<T>(path);
  } catch {
    return fallback;
  }
}

export async function Header() {
  const [branding, destinations] = await Promise.all([getBranding(), safeFetch<DestinationDto[]>("/public/destinations", [])]);

  return branding.templateSlug === "modern" ? (
    <ModernHeader siteName={branding.siteName} logoUrl={branding.logoUrl} destinations={destinations} googleEnabled={branding.googleLoginEnabled} />
  ) : (
    <ClassicHeader siteName={branding.siteName} logoUrl={branding.logoUrl} destinations={destinations} googleEnabled={branding.googleLoginEnabled} />
  );
}
