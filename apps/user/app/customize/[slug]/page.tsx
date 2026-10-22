import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PublicDestinationDetailDto, PublicHomepageDto } from "@paxbook/types";
import { publicFetchOrNull } from "@/lib/api";
import { TripCustomizerWizard } from "@/components/TripCustomizerWizard";
import { TRAVELLER_TYPES } from "@/lib/trip-wizard-constants";

async function getDestination(slug: string) {
  return publicFetchOrNull<PublicDestinationDetailDto>(`/public/destinations/${slug}`);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const destination = await getDestination(params.slug);
  return { title: destination ? `Customize your ${destination.name} trip` : "Customize your trip" };
}

export default async function CustomizeTripPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { travellerType?: string };
}) {
  const [destination, home] = await Promise.all([getDestination(params.slug), publicFetchOrNull<PublicHomepageDto>("/public/homepage")]);
  if (!destination) notFound();

  // Traveller-type photos come from the homepage "who_coming_along" personas (CMS), Group has a built-in one.
  const travellerImages: Record<string, string> = { Group: "/personas/group.jpg" };
  const personas = home?.homepageBlocks.find((b) => b.type === "who_coming_along")?.configJson.items as { category?: string; imageUrl?: string | null }[] | undefined;
  const norm = (s: string) => s.toLowerCase().replace(/s$/, "");
  for (const type of TRAVELLER_TYPES) {
    const photo = personas?.find((p) => p.category && p.imageUrl && norm(p.category) === norm(type))?.imageUrl;
    if (photo) travellerImages[type] = photo;
  }

  return <TripCustomizerWizard destination={destination} initialTravellerType={searchParams.travellerType} travellerImages={travellerImages} />;
}
