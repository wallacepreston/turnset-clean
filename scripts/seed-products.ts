#!/usr/bin/env node

/**
 * Script to seed products into Shopify using the Admin API
 * 
 * Usage:
 *   pnpm tsx scripts/seed-products.ts
 * 
 * Requires environment variables:
 *   SHOPIFY_STORE_DOMAIN - Your store domain (e.g., turnset-clean.myshopify.com)
 *   SHOPIFY_ADMIN_API_TOKEN - Your Admin API access token
 */

// Load environment variables from .env.local
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { readFileSync } from "fs";
import { join } from "path";

interface ProductVariant {
  option1?: string;
  price: string;
  requires_shipping: boolean;
  taxable: boolean;
}

interface ProductInput {
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  variants: ProductVariant[];
}

interface ShopifyProductResponse {
  product: {
    id: number;
    title: string;
    handle: string;
  };
}

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = "2025-01";

if (!SHOPIFY_STORE_DOMAIN) {
  console.error("❌ Error: SHOPIFY_STORE_DOMAIN environment variable is required");
  console.error("   Example: SHOPIFY_STORE_DOMAIN=turnset-clean.myshopify.com");
  process.exit(1);
}

if (!SHOPIFY_ADMIN_API_TOKEN) {
  console.error("❌ Error: SHOPIFY_ADMIN_API_TOKEN environment variable is required");
  console.error("   This should be an Admin API access token, not a Storefront API token");
  process.exit(1);
}

const API_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/products.json`;
const GRAPHQL_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

// GraphQL query to find the Storefront API sales channel
const FIND_CHANNEL_QUERY = `
  query FindChannel {
    channels(first: 100) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

// GraphQL query to find publications
const FIND_PUBLICATIONS_QUERY = `
  query FindPublications {
    publications(first: 100) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

// GraphQL mutation to publish a product to a sales channel
const PUBLISH_PRODUCT_MUTATION = `
  mutation PublishProduct($productId: ID!, $publicationId: ID!) {
    publishablePublish(id: $productId, input: { publicationId: $publicationId }) {
      publishable {
        ... on Product {
          id
          title
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface PublicationNode {
  id: string;
  name: string;
}

interface ChannelNode {
  id: string;
  name: string;
}

interface PublicationsResponse {
  data?: {
    publications: {
      edges: Array<{
        node: PublicationNode;
      }>;
    };
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

interface ChannelsResponse {
  data?: {
    channels: {
      edges: Array<{
        node: ChannelNode;
      }>;
    };
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

interface PublishResponse {
  data?: {
    publishablePublish: {
      publishable: {
        id: string;
        title: string;
      } | null;
      userErrors: Array<{
        field: string[];
        message: string;
      }>;
    } | null;
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

/**
 * Find the Storefront API sales channel publication ID
 */
async function findStorefrontChannel(): Promise<string | null> {
  if (!SHOPIFY_ADMIN_API_TOKEN) {
    throw new Error("SHOPIFY_ADMIN_API_TOKEN is not set");
  }

  try {
    // First, query channels to find the Storefront API channel
    const channelResponse = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
      },
      body: JSON.stringify({
        query: FIND_CHANNEL_QUERY,
      }),
    });

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      throw new Error(`HTTP ${channelResponse.status}: ${channelResponse.statusText}\n${errorText}`);
    }

    const channelData = (await channelResponse.json()) as ChannelsResponse;

    // Check for GraphQL errors
    if (channelData.errors && channelData.errors.length > 0) {
      console.error("❌ GraphQL errors:", channelData.errors);
      throw new Error(
        `GraphQL errors: ${channelData.errors.map((e) => e.message).join(", ")}`
      );
    }

    // Check if data exists
    if (!channelData.data || !channelData.data.channels) {
      console.error("❌ Unexpected response structure:", JSON.stringify(channelData, null, 2));
      throw new Error("Unexpected GraphQL response structure");
    }

    const channels = channelData.data.channels.edges;

    // Look for the Storefront API channel (name might vary slightly)
    const storefrontChannel = channels.find(
      (edge) =>
        edge.node.name.toLowerCase().includes("storefront") ||
        edge.node.name === "Turnset Clean Storefront API"
    );

    if (!storefrontChannel) {
      // If not found, log available channels for debugging
      console.warn(
        "⚠️  Storefront API channel not found. Available channels:",
        channels.map((c) => c.node.name)
      );
      return null;
    }

    // Now query publications to find the one associated with this channel
    const pubResponse = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
      },
      body: JSON.stringify({
        query: FIND_PUBLICATIONS_QUERY,
      }),
    });

    if (!pubResponse.ok) {
      const errorText = await pubResponse.text();
      throw new Error(`HTTP ${pubResponse.status}: ${pubResponse.statusText}\n${errorText}`);
    }

    const pubData = (await pubResponse.json()) as PublicationsResponse;

    // Debug: log the full response in development
    if (process.env.NODE_ENV !== "production") {
      console.log("🔍 Publications response:", JSON.stringify(pubData, null, 2));
    }

    // Check for GraphQL errors
    if (pubData.errors && pubData.errors.length > 0) {
      console.error("❌ GraphQL errors:", pubData.errors);
      throw new Error(
        `GraphQL errors: ${pubData.errors.map((e) => e.message).join(", ")}`
      );
    }

    // Check if data exists
    if (!pubData.data || !pubData.data.publications) {
      console.error("❌ Unexpected publications response structure:", JSON.stringify(pubData, null, 2));
      throw new Error("Unexpected GraphQL response structure");
    }

    const publications = pubData.data.publications.edges;

    // Try to find a publication that matches the channel name
    // Publications often have names like "Online Store" or match the channel name
    const matchingPublication = publications.find(
      (edge) =>
        edge.node.name.toLowerCase().includes("storefront") ||
        edge.node.name === storefrontChannel.node.name ||
        edge.node.name === "Turnset Clean Storefront API"
    );

    if (matchingPublication) {
      return matchingPublication.node.id;
    }

    // If no exact match, log available publications for debugging
    console.warn(
      `⚠️  No publication found for Storefront API channel "${storefrontChannel.node.name}". Available publications:`,
      publications.map((p) => p.node.name)
    );
    return null;
  } catch (error) {
    console.error("❌ Error finding Storefront API channel:", error);
    return null;
  }
}

/**
 * Publish a product to a sales channel using publication ID
 */
async function publishProductToChannel(
  productId: number,
  publicationId: string
): Promise<boolean> {
  if (!SHOPIFY_ADMIN_API_TOKEN) {
    throw new Error("SHOPIFY_ADMIN_API_TOKEN is not set");
  }

  // Convert numeric product ID to GraphQL ID format
  const graphqlProductId = `gid://shopify/Product/${productId}`;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
      },
      body: JSON.stringify({
        query: PUBLISH_PRODUCT_MUTATION,
        variables: {
          productId: graphqlProductId,
          publicationId: publicationId,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
    }

    const data = (await response.json()) as PublishResponse;

    // Debug: log the full response in development
    if (process.env.NODE_ENV !== "production") {
      console.log("🔍 Publish response:", JSON.stringify(data, null, 2));
    }

    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      console.error("❌ GraphQL errors:", data.errors);
      return false;
    }

    // Check if data exists
    if (!data.data || !data.data.publishablePublish) {
      console.error("❌ Unexpected publish response structure:", JSON.stringify(data, null, 2));
      return false;
    }

    const result = data.data.publishablePublish;

    // Check for user errors
    if (result.userErrors && result.userErrors.length > 0) {
      console.error(
        "❌ Publishing errors:",
        result.userErrors.map((e) => e.message).join(", ")
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Error publishing product to channel:", error);
    return false;
  }
}

async function createProduct(product: ProductInput): Promise<number> {
  if (!SHOPIFY_ADMIN_API_TOKEN) {
    throw new Error("SHOPIFY_ADMIN_API_TOKEN is not set");
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
      },
      body: JSON.stringify({ product }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}\n${errorText}`
      );
    }

    const data = (await response.json()) as ShopifyProductResponse;
    console.log(`✅ Created: ${data.product.title} (handle: ${data.product.handle})`);

    return data.product.id;
  } catch (error) {
    console.error(`❌ Failed to create product "${product.title}":`, error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting product seeding...\n");

  // Read products from JSON file
  const productsPath = join(process.cwd(), "seed", "products.json");
  let products: ProductInput[];

  try {
    const fileContent = readFileSync(productsPath, "utf-8");
    products = JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Error reading products file at ${productsPath}:`, error);
    process.exit(1);
  }

  if (!Array.isArray(products) || products.length === 0) {
    console.error("❌ Error: products.json must contain an array of products");
    process.exit(1);
  }

  console.log(`📦 Found ${products.length} products to create\n`);

  // Find the Storefront API channel publication ID
  console.log("🔍 Finding Storefront API sales channel...");
  const publicationId = await findStorefrontChannel();
  if (publicationId) {
    console.log(`✅ Found Storefront API publication: ${publicationId}\n`);
  } else {
    console.warn(
      "⚠️  Storefront API channel not found. Products will be created but not published to the channel.\n"
    );
  }

  // Create products one by one
  let successCount = 0;
  let failCount = 0;
  let publishedCount = 0;

  for (const product of products) {
    try {
      const productId = await createProduct(product);
      successCount++;

      // Publish to Storefront API channel if publication ID is available
      if (publicationId && productId) {
        const published = await publishProductToChannel(productId, publicationId);
        if (published) {
          publishedCount++;
          console.log(`   📢 Published to Storefront API channel`);
        }
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      failCount++;
      console.error(`   Skipping due to error above\n`);
    }
  }

  console.log(`\n✨ Seeding complete!`);
  console.log(`   ✅ Created: ${successCount}`);
  if (publicationId) {
    console.log(`   📢 Published to Storefront API: ${publishedCount}`);
  }
  console.log(`   ❌ Failed: ${failCount}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

