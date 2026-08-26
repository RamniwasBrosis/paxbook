import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PublicDestinationDetailDto } from "@paxbook/types";
import { publicFetchOrNull } from "@/lib/api";
import { TripCustomizerWizard } from "@/components/TripCustomizerWizard";

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
  const destination = await getDestination(params.slug);
  if (!destination) notFound();

  return <TripCustomizerWizard destination={destination} initialTravellerType={searchParams.travellerType} />;
}
