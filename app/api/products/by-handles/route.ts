import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceProductByHandle } from "@/lib/shopify";
import type { Product } from "@/lib/types";

const handlesSchema = z.array(z.string()).max(10);

/**
 * POST /api/products/by-handles - Get products by handles
 * Used for fetching recently viewed products
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const handles = handlesSchema.parse(body);

    const products = await Promise.all(
      handles.map(async (handle) => {
        try {
          return await getServiceProductByHandle(handle);
        } catch (error) {
          console.error(`Error fetching product ${handle}:`, error);
          return null;
        }
      })
    );

    // Filter out nulls
    const validProducts = products.filter(
      (p): p is Product => p !== null
    );

    return NextResponse.json({ products: validProducts }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error("Products API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch products",
        },
      },
      { status: 500 }
    );
  }
}
