import type { PrismaService } from "../prisma/prisma.service";
import type { SeoMetaDto } from "./seo-meta.dto";

/** Shared by Destinations/Packages/Blog services — SeoMeta is a polymorphic 1:1 keyed by (entityType, entityId). */
export async function upsertSeoMeta(
  prisma: PrismaService,
  entityType: string,
  entityId: string,
  seo: SeoMetaDto | undefined,
): Promise<void> {
  if (!seo) return;

  await prisma.seoMeta.upsert({
    where: { entityType_entityId: { entityType, entityId } },
    update: {
      title: seo.title,
      description: seo.description,
      ogImageKey: seo.ogImageKey,
      canonicalUrl: seo.canonicalUrl,
    },
    create: {
      entityType,
      entityId,
      title: seo.title,
      description: seo.description,
      ogImageKey: seo.ogImageKey,
      canonicalUrl: seo.canonicalUrl,
    },
  });
}
