import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PublicPackageDetailDto } from "@paxbook/types";
import { publicFetchOrNull } from "@/lib/api";
import { ViewPriceWizard } from "@/components/ViewPriceWizard";

async function getPackage(slug: string) {
  return publicFetchOrNull<PublicPackageDetailDto>(`/public/packages/${slug}`);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const pkg = await getPackage(params.slug);
  return { title: pkg ? `View price — ${pkg.title}` : "View price" };
}

export default async function ViewPricePage({ params }: { params: { slug: string } }) {
  const pkg = await getPackage(params.slug);
  if (!pkg) notFound();

  return <ViewPriceWizard pkg={pkg} />;
}
