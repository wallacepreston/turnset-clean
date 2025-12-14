import { cache } from "react";
import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { getEnv } from "./env";
import type {
  Product,
  ProductVariant,
  ShopifyProductNode,
  ShopifyProductsResponse,
  ShopifyProductResponse,
  Cart,
  CartLine,
} from "./types";

// Initialize Shopify client
function getShopifyClient() {
  const env = getEnv();
  
  // Extract store domain from URL (e.g., "https://store.myshopify.com/api/..." -> "store.myshopify.com")
  let storeDomain: string;
  try {
    const url = new URL(env.SHOPIFY_STOREFRONT_API_URL);
    storeDomain = url.hostname;
    
    // Validate the URL format
    if (!storeDomain.includes("myshopify.com") && !storeDomain.includes("shopifycdn.com")) {
      console.warn(
        `Warning: Store domain "${storeDomain}" doesn't look like a Shopify domain. ` +
          "Expected format: store-name.myshopify.com"
      );
    }
  } catch (urlError) {
    throw new Error(
      `Invalid SHOPIFY_STOREFRONT_API_URL format: ${env.SHOPIFY_STOREFRONT_API_URL}. ` +
        "Expected format: https://store-name.myshopify.com/api/2025-01/graphql.json"
    );
  }

  // Validate token format (Storefront tokens are typically longer and don't start with shpat_)
  const token = env.SHOPIFY_STOREFRONT_API_TOKEN.trim();
  if (token.startsWith("shpat_")) {
    console.warn(
      "Warning: Token starts with 'shpat_' which suggests it might be an Admin API token. " +
        "Storefront API tokens typically look different. Please verify you're using a Storefront API access token."
    );
  }

  if (!token || token.length < 10) {
    throw new Error(
      "Invalid SHOPIFY_STOREFRONT_API_TOKEN: Token appears to be empty or too short. " +
        "Please verify your environment variables."
    );
  }

  try {
    return createStorefrontApiClient({
      storeDomain,
      apiVersion: "2025-01",
      publicAccessToken: token,
    });
  } catch (clientError) {
    throw new Error(
      `Failed to create Shopify client: ${clientError instanceof Error ? clientError.message : "Unknown error"}. ` +
        `Store domain: ${storeDomain}, API version: 2025-01`
    );
  }
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
 * @ToPresent @caching: React cache() for request deduplication + Next.js revalidate for time-based invalidation
 * Fetch all service products from Shopify
 * 
 * Note: The Storefront API only returns products that are:
 * - Published (status: Active, not Draft or Archived)
 * - Available in the sales channel associated with the Storefront API token
 * - Have at least one variant available for sale
 * 
 * How it integrates:
 * - React cache() deduplicates calls within a single render (if called multiple times, only one API request)
 * - Next.js revalidate controls when the page regenerates, creating a new render context
 * - Together: cache() prevents duplicate requests per render, revalidate controls freshness
 */
export const getAllServiceProducts = cache(async (): Promise<Product[]> => {
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
      
      // Handle network-level errors (fetch failed)
      if (
        typeof response.errors === "object" &&
        "message" in response.errors &&
        String(response.errors.message).includes("fetch failed")
      ) {
        console.error("Shopify network error:", response.errors);
        throw new Error(
          "Shopify API network error: Failed to connect to Shopify. " +
            "Please verify:\n" +
            "1. Your SHOPIFY_STOREFRONT_API_URL is correct and accessible\n" +
            "2. Your network connection is working\n" +
            "3. The Shopify store is online and accessible\n" +
            `Original error: ${errorMessage}`
        );
      }
      
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
    // Re-throw if it's already a formatted error
    if (error instanceof Error && error.message.includes("Shopify API")) {
      throw error;
    }
    
    // Handle network errors that weren't caught above
    if (error instanceof Error && error.message.includes("fetch")) {
      console.error("Network error fetching products from Shopify:", error);
      throw new Error(
        "Failed to fetch products from Shopify: Network error. " +
          "Please check your SHOPIFY_STOREFRONT_API_URL and network connection."
      );
    }
    
    console.error("Error fetching products from Shopify:", error);
    throw new Error(
      `Failed to fetch products from Shopify: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

/**
 * @ToPresent @caching: React cache() for request deduplication + Next.js revalidate for time-based invalidation
 * Fetch a single service product by handle from Shopify
 * 
 * How it integrates:
 * - React cache() deduplicates calls within a single render (if called multiple times, only one API request)
 * - Next.js revalidate controls when the page regenerates, creating a new render context
 * - Together: cache() prevents duplicate requests per render, revalidate controls freshness
 */
export const getServiceProductByHandle = cache(async (
  handle: string
): Promise<Product | null> => {
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
      
      // Handle network-level errors (fetch failed)
      if (
        typeof response.errors === "object" &&
        "message" in response.errors &&
        String(response.errors.message).includes("fetch failed")
      ) {
        console.error("Shopify network error:", response.errors);
        throw new Error(
          "Shopify API network error: Failed to connect to Shopify. " +
            "Please verify:\n" +
            "1. Your SHOPIFY_STOREFRONT_API_URL is correct and accessible\n" +
            "2. Your network connection is working\n" +
            "3. The Shopify store is online and accessible\n" +
            `Original error: ${errorMessage}`
        );
      }
      
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
    // Re-throw if it's already a formatted error
    if (error instanceof Error && error.message.includes("Shopify API")) {
      throw error;
    }
    
    // Handle network errors that weren't caught above
    if (error instanceof Error && error.message.includes("fetch")) {
      console.error(`Network error fetching product ${handle} from Shopify:`, error);
      throw new Error(
        `Failed to fetch product ${handle} from Shopify: Network error. ` +
          "Please check your SHOPIFY_STOREFRONT_API_URL and network connection."
      );
    }
    
    console.error(`Error fetching product ${handle} from Shopify:`, error);
    throw new Error(
      `Failed to fetch product ${handle} from Shopify: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

// ============================================================================
// Cart Management Mutations
// ============================================================================

const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_GET_QUERY = `
  query GetCart($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      totalQuantity
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  title
                  handle
                  featuredImage {
                    url
                    altText
                  }
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Create a new cart
 * Note: This should be called from an API route, not directly from server components
 */
export async function createCart(): Promise<Cart> {
  const client = getShopifyClient();
  const response = await client.request(CART_CREATE_MUTATION, {
    variables: { input: {} },
  });

  if (response.errors) {
    throw new Error(`Shopify API error: ${JSON.stringify(response.errors)}`);
  }

  const data = response.data as {
    cartCreate: {
      cart: Cart;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  };

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(
      `Cart creation errors: ${data.cartCreate.userErrors.map((e) => e.message).join(", ")}`
    );
  }

  return data.cartCreate.cart;
}

/**
 * Get a cart by ID
 */
export async function getCart(cartId: string): Promise<Cart | null> {
  const client = getShopifyClient();
  const response = await client.request(CART_GET_QUERY, {
    variables: { id: cartId },
  });

  if (response.errors) {
    throw new Error(`Shopify API error: ${JSON.stringify(response.errors)}`);
  }

  const data = response.data as { cart: Cart | null };
  return data.cart;
}

/**
 * Add items to a cart
 */
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<Cart> {
  const client = getShopifyClient();
  const response = await client.request(CART_LINES_ADD_MUTATION, {
    variables: {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity,
        },
      ],
    },
  });

  if (response.errors) {
    throw new Error(`Shopify API error: ${JSON.stringify(response.errors)}`);
  }

  const data = response.data as {
    cartLinesAdd: {
      cart: Cart;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  };

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(
      `Add to cart errors: ${data.cartLinesAdd.userErrors.map((e) => e.message).join(", ")}`
    );
  }

  return data.cartLinesAdd.cart;
}

/**
 * Remove items from a cart
 */
export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const client = getShopifyClient();
  const response = await client.request(CART_LINES_REMOVE_MUTATION, {
    variables: {
      cartId,
      lineIds,
    },
  });

  if (response.errors) {
    throw new Error(`Shopify API error: ${JSON.stringify(response.errors)}`);
  }

  const data = response.data as {
    cartLinesRemove: {
      cart: Cart;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  };

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(
      `Remove from cart errors: ${data.cartLinesRemove.userErrors.map((e) => e.message).join(", ")}`
    );
  }

  return data.cartLinesRemove.cart;
}

