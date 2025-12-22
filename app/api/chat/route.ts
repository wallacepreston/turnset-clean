import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { getAllServiceProducts } from "@/lib/shopify";
import { getOpenAIEnv } from "@/lib/env";
import type { Product } from "@/lib/types";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Format product catalog for AI chat system prompt
 * 
 * Note: getAllServiceProducts() already handles caching with Next.js cache directives
 * (1-minute revalidation via 'use cache' and cacheLife). This function just formats
 * the cached products into a string for the system prompt.
 */
async function getProductCatalog(): Promise<string> {
  'use cache';
  cacheLife('minutes'); // ISR: revalidate every minute (products/pricing change more frequently)
  cacheTag('shopify-products', 'ai-chat-catalog'); // Tag for on-demand invalidation
  
  let products: Product[] = [];
  try {
    products = await getAllServiceProducts();
  } catch (error) {
    console.error("Error fetching products for chat catalog:", error);
    // Return empty catalog string if fetch fails
    return "No products available at the moment.";
  }

  if (products.length === 0) {
    return "No products available at the moment.";
  }

  // Build product catalog context for the system prompt
  return products
    .map((product) => {
      const price = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: product.priceRange.minVariantPrice.currencyCode,
      }).format(parseFloat(product.priceRange.minVariantPrice.amount));

      return `- ${product.title} (handle: ${product.handle}): ${product.description || "Premium cleaning product"} - ${price}`;
    })
    .join("\n");
}

export async function POST(req: Request) {
  try {
    // Verify OpenAI API key is set (openai provider will use OPENAI_API_KEY env var)
    getOpenAIEnv();

    // Parse request body
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          status: 400,
          code: "INVALID_REQUEST",
          message: "Messages array is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get product catalog (caching is handled by getAllServiceProducts())
    const productCatalog = await getProductCatalog();

    // Build system prompt
    const systemPrompt = `You are a helpful shopping assistant for TurnSet Clean, a premium cleaning products store. Your role is to help customers find the right products based on their needs.

Available Products:
${productCatalog}

Guidelines:
1. Listen to what the customer is looking for and suggest relevant products from the catalog above.
2. When suggesting products, mention the product title and use the format: [product-handle] to reference products.
3. Be friendly, helpful, and concise.
4. If a customer asks about something not in the catalog, politely let them know and suggest similar products if available.
5. Focus on helping customers find products that match their cleaning needs (bathroom, kitchen, laundry, general cleaning, etc.).

When you suggest a product, format it like this: "Check out our [product-handle] - it's perfect for [use case]!"`;

    // Convert UIMessages to ModelMessages
    const modelMessages = convertToModelMessages(messages);

    // Create streaming response
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: modelMessages,
      maxOutputTokens: 500,
    });

    // Return UIMessage stream response for DefaultChatTransport
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    // Don't leak error details to client
    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return new Response(
        JSON.stringify({
          status: 500,
          code: "CONFIGURATION_ERROR",
          message: "AI chat is not properly configured. Please contact support.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 500,
        code: "INTERNAL_ERROR",
        message: "An error occurred while processing your request.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

