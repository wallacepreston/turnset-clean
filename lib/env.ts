import { z } from "zod";

const envSchema = z.object({
  SHOPIFY_STOREFRONT_API_URL: z.string().url(),
  SHOPIFY_STOREFRONT_API_TOKEN: z.string().min(1),
  SANITY_PROJECT_ID: z.string().min(1).optional(),
  SANITY_DATASET: z.string().min(1).optional(),
  SANITY_API_TOKEN: z.string().min(1).optional(),
});

export function getEnv() {
  const parsed = envSchema.safeParse({
    SHOPIFY_STOREFRONT_API_URL: process.env.SHOPIFY_STOREFRONT_API_URL,
    SHOPIFY_STOREFRONT_API_TOKEN: process.env.SHOPIFY_STOREFRONT_API_TOKEN,
    SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
    SANITY_DATASET: process.env.SANITY_DATASET,
    SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
  });

  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((e) => e.path.join("."))
      .join(", ");

    throw new Error(
      `Missing required environment variables: ${missing}. ` +
        "Please check your .env.local file or Vercel environment variables."
    );
  }

  return parsed.data;
}

export function getSanityEnv() {
  // Use NEXT_PUBLIC_ vars (same as Studio) for consistency, with fallback to non-public vars
  const projectId =
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    process.env.SANITY_PROJECT_ID;
  const dataset =
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    process.env.SANITY_DATASET ||
    "production";
  const apiToken = process.env.SANITY_API_TOKEN;

  if (!projectId) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_PROJECT_ID is required. Please check your .env.local file or Vercel environment variables."
    );
  }

  return { projectId, dataset, apiToken };
}

