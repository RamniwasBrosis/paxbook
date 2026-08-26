import { z } from "zod";

/**
 * Shared API env schema. The NestJS app validates process.env against this at
 * boot (fail-fast on misconfiguration) instead of trusting untyped env reads
 * scattered across modules.
 */
export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().url().or(z.string().startsWith("postgresql://")),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

  CUSTOMER_JWT_ACCESS_SECRET: z.string().min(32),
  CUSTOMER_JWT_ACCESS_TTL: z.string().default("15m"),
  CUSTOMER_JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

  VENDOR_JWT_ACCESS_SECRET: z.string().min(32),
  VENDOR_JWT_ACCESS_TTL: z.string().default("15m"),
  VENDOR_JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

  TENANT_BASE_DOMAIN: z.string().default("localhost"),

  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  STORAGE_ROOT: z.string().default("./uploads"),
  STORAGE_PUBLIC_BASE_URL: z.string().default("http://localhost:4000/uploads"),

  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  INTEGRATION_ENCRYPTION_KEY: z.string().optional(),

  CORS_ORIGINS: z.string().default("http://localhost:3000"),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export const adminPublicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:4000/api/v1"),
});

export type AdminPublicEnv = z.infer<typeof adminPublicEnvSchema>;
