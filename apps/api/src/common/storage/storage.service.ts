import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaService } from "../prisma/prisma.service";
import { decryptSecret } from "../crypto/encryption";

export interface UploadedFileResult {
  key: string;
  url: string;
}

function sanitizeFilename(originalName: string): string {
  return originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

function contentTypeFromName(name: string): string {
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".mp4")) return "video/mp4";
  if (name.endsWith(".webm")) return "video/webm";
  if (name.endsWith(".mov")) return "video/quicktime";
  return "image/jpeg";
}

/**
 * Storage is per-tenant: each agency can plug in their own S3-compatible bucket from
 * Settings -> Integrations. When a tenant hasn't configured one, uploads fall back to
 * local disk under STORAGE_ROOT — fine for a single VPS, and never a hard failure.
 */
@Injectable()
export class StorageService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async uploadFile(tenantId: string | null, buffer: Buffer, originalName: string): Promise<UploadedFileResult> {
    const key = `${randomUUID()}-${sanitizeFilename(originalName)}`;

    const s3Config = tenantId ? await this.getS3Config(tenantId) : null;
    if (s3Config) {
      const client = new S3Client({
        region: s3Config.region,
        credentials: { accessKeyId: s3Config.accessKeyId, secretAccessKey: s3Config.secretAccessKey },
      });
      await client.send(
        new PutObjectCommand({
          Bucket: s3Config.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentTypeFromName(originalName),
        }),
      );
      const base = s3Config.publicBaseUrl || `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com`;
      return { key, url: `${base.replace(/\/$/, "")}/${key}` };
    }

    const storageRoot = this.configService.get<string>("STORAGE_ROOT", "./uploads");
    const publicBaseUrl = this.configService.get<string>("STORAGE_PUBLIC_BASE_URL", "http://localhost:4000/uploads");
    const absoluteRoot = join(process.cwd(), storageRoot);
    await mkdir(absoluteRoot, { recursive: true });
    await writeFile(join(absoluteRoot, key), buffer);

    return { key, url: `${publicBaseUrl.replace(/\/$/, "")}/${key}` };
  }

  /** Turns a stored key back into a fetchable URL for API responses. Null-safe for optional image fields. */
  buildPublicUrl(key: string | null | undefined): string | null {
    if (!key) return null;
    const publicBaseUrl = this.configService.get<string>("STORAGE_PUBLIC_BASE_URL", "http://localhost:4000/uploads");
    return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }

  private async getS3Config(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { s3AccessKeyId: true, s3SecretAccessKeyEncrypted: true, s3Bucket: true, s3Region: true, s3PublicBaseUrl: true },
    });
    if (!tenant?.s3AccessKeyId || !tenant.s3SecretAccessKeyEncrypted || !tenant.s3Bucket || !tenant.s3Region) return null;

    const encryptionKey = this.configService.get<string>("INTEGRATION_ENCRYPTION_KEY");
    if (!encryptionKey) return null;

    return {
      accessKeyId: tenant.s3AccessKeyId,
      secretAccessKey: decryptSecret(tenant.s3SecretAccessKeyEncrypted, encryptionKey),
      bucket: tenant.s3Bucket,
      region: tenant.s3Region,
      publicBaseUrl: tenant.s3PublicBaseUrl,
    };
  }
}
