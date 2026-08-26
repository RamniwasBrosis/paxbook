import type { MetadataRoute } from "next";
import type { DestinationDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [entries, destinations] = await Promise.all([
    publicFetch<{ url: string; lastModified: string; priority: number }[]>("/public/sitemap"),
    publicFetch<DestinationDto[]>("/public/destinations"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = ["/", "/destinations", "/packages", "/blog", "/visa-guide"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    priority: path === "/" ? 1 : 0.7,
  }));

  const destinationRoutes: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${SITE_URL}/destinations/${d.slug}`,
    lastModified: d.updatedAt,
    priority: 0.6,
  }));

  const publishedRoutes: MetadataRoute.Sitemap = entries.map((e) => ({
    url: `${SITE_URL}${e.url}`,
    lastModified: e.lastModified,
    priority: e.priority,
  }));

  return [...staticRoutes, ...destinationRoutes, ...publishedRoutes];
}
