import { z } from "zod";

const envSchema = z.object({
  SHOPIFY_STOREFRONT_API_URL: z.string().url(),
  SHOPIFY_STOREFRONT_API_TOKEN: z.string().min(1),
});

export function getEnv() {
  const parsed = envSchema.safeParse({
    SHOPIFY_STOREFRONT_API_URL: process.env.SHOPIFY_STOREFRONT_API_URL,
    SHOPIFY_STOREFRONT_API_TOKEN: process.env.SHOPIFY_STOREFRONT_API_TOKEN,
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

