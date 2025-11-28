import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { getEnv } from "./env";
import type {
  Product,
  ProductVariant,
  ShopifyProductNode,
  ShopifyProductsResponse,
  ShopifyProductResponse,
} from "./types";

// Initialize Shopify client
function getShopifyClient() {
  const env = getEnv();
  // Extract store domain from URL (e.g., "https://store.myshopify.com/api/..." -> "store.myshopify.com")
  const url = new URL(env.SHOPIFY_STOREFRONT_API_URL);
  const storeDomain = url.hostname;

  // Validate token format (Storefront tokens are typically longer and don't start with shpat_)
  const token = env.SHOPIFY_STOREFRONT_API_TOKEN.trim();
  if (token.startsWith("shpat_")) {
    console.warn(
      "Warning: Token starts with 'shpat_' which suggests it might be an Admin API token. " +
        "Storefront API tokens typically look different. Please verify you're using a Storefront API access token."
    );
  }

  return createStorefrontApiClient({
    storeDomain,
    apiVersion: "2025-01",
    publicAccessToken: token,
  });
}

// GraphQL query to fetch all products
const ALL_PRODUCTS_QUERY = `
  query GetAllProducts {
    products(first: 250) {
      edges {
        node {
          id
          title
          handle
          description
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

// GraphQL query to fetch a single product by handle
const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
          }
        }
      }
    }
  }
`;

// Transform Shopify product node to our Product type
function transformProduct(node: ShopifyProductNode): Product {
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    featuredImage: node.featuredImage
      ? {
          url: node.featuredImage.url,
          altText: node.featuredImage.altText || undefined,
        }
      : undefined,
    priceRange: node.priceRange,
    variants: node.variants.edges.map(
      (edge: { node: ProductVariant }) => ({
        id: edge.node.id,
        title: edge.node.title,
        price: edge.node.price,
        availableForSale: edge.node.availableForSale,
      })
    ),
  };
}

/**
 * Fetch all service products from Shopify
 * 
 * Note: The Storefront API only returns products that are:
 * - Published (status: Active, not Draft or Archived)
 * - Available in the sales channel associated with the Storefront API token
 * - Have at least one variant available for sale
 */
export async function getAllServiceProducts(): Promise<Product[]> {
  try {
    const client = getShopifyClient();
    const response = await client.request(ALL_PRODUCTS_QUERY, {
      variables: {},
    });

    if (response.errors) {
      const errorMessage =
        typeof response.errors === "object" && "message" in response.errors
          ? String(response.errors.message)
          : "Unknown Shopify API error";
      
      // Provide helpful error message for 401 errors
      if (
        typeof response.errors === "object" &&
        "networkStatusCode" in response.errors &&
        response.errors.networkStatusCode === 401
      ) {
        console.error("Shopify GraphQL errors:", response.errors);
        throw new Error(
          "Shopify API authentication failed (401 Unauthorized). " +
            "Please verify:\n" +
            "1. Your SHOPIFY_STOREFRONT_API_TOKEN is a valid Storefront API access token\n" +
            "2. The token has 'unauthenticated_read_products' scope enabled\n" +
            "3. The app is installed and the token is active\n" +
            "4. You're using a Storefront API token, not an Admin API token"
        );
      }
      
      console.error("Shopify GraphQL errors:", response.errors);
      throw new Error(`Shopify API error: ${errorMessage}`);
    }

    const data = response.data as ShopifyProductsResponse["data"];

    if (!data?.products?.edges) {
      console.warn("No products found in Shopify response");
      return [];
    }

    // Log raw response for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log(`[Shopify] Raw API response: ${data.products.edges.length} product(s) returned`);
      data.products.edges.forEach((edge) => {
        const node = edge.node;
        const availableVariants = node.variants.edges.filter(
          (v) => v.node.availableForSale
        ).length;
        console.log(`  - ${node.title} (${node.handle}): ${node.variants.edges.length} variant(s), ${availableVariants} available for sale`);
      });
    }

    const products = data.products.edges.map((edge) => transformProduct(edge.node));
    
    // Log transformed products (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log(`[Shopify] Transformed ${products.length} product(s):`, 
        products.map(p => ({ 
          title: p.title, 
          handle: p.handle,
          variants: p.variants.length,
          availableVariants: p.variants.filter(v => v.availableForSale).length
        }))
      );
    }

    return products;
  } catch (error) {
    console.error("Error fetching products from Shopify:", error);
    throw new Error("Failed to fetch products from Shopify");
  }
}

/**
 * Fetch a single service product by handle from Shopify
 */
export async function getServiceProductByHandle(
  handle: string
): Promise<Product | null> {
  try {
    const client = getShopifyClient();
    const response = await client.request(PRODUCT_BY_HANDLE_QUERY, {
      variables: { handle },
    });

    if (response.errors) {
      const errorMessage =
        typeof response.errors === "object" && "message" in response.errors
          ? String(response.errors.message)
          : "Unknown Shopify API error";
      
      // Provide helpful error message for 401 errors
      if (
        typeof response.errors === "object" &&
        "networkStatusCode" in response.errors &&
        response.errors.networkStatusCode === 401
      ) {
        console.error("Shopify GraphQL errors:", response.errors);
        throw new Error(
          "Shopify API authentication failed (401 Unauthorized). " +
            "Please verify:\n" +
            "1. Your SHOPIFY_STOREFRONT_API_TOKEN is a valid Storefront API access token\n" +
            "2. The token has 'unauthenticated_read_products' scope enabled\n" +
            "3. The app is installed and the token is active\n" +
            "4. You're using a Storefront API token, not an Admin API token"
        );
      }
      
      console.error("Shopify GraphQL errors:", response.errors);
      throw new Error(`Shopify API error: ${errorMessage}`);
    }

    const data = response.data as ShopifyProductResponse["data"];

    if (!data?.product) {
      return null;
    }

    return transformProduct(data.product);
  } catch (error) {
    console.error(`Error fetching product ${handle} from Shopify:`, error);
    throw new Error(`Failed to fetch product ${handle} from Shopify`);
  }
}

