import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SHOPIFY_STORE_URL: z.string().min(1, "SHOPIFY_STORE_URL is required"),
  SHOPIFY_ACCESS_TOKEN: z.string().min(1, "SHOPIFY_ACCESS_TOKEN is required"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
});

export const env = envSchema.parse(process.env);
