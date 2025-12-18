import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  createCart,
  getCart,
  addToCart,
  removeFromCart,
} from "@/lib/shopify";

const CART_ID_KEY = "shopify_cart_id";

const addToCartSchema = z.object({
  cartId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().positive().default(1),
});

const removeFromCartSchema = z.object({
  cartId: z.string(),
  lineIds: z.array(z.string()).min(1),
});

/**
 * POST /api/cart - Create a new cart
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const cart = await createCart();
      // Set cookie in route handler (this is allowed)
      const cookieStore = await cookies();
      cookieStore.set(CART_ID_KEY, cart.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return NextResponse.json({ cart }, { status: 200 });
    }

    if (action === "add") {
      const validated = addToCartSchema.parse(body);
      const cart = await addToCart(
        validated.cartId,
        validated.variantId,
        validated.quantity
      );
      // Ensure cookie is set (in case it was missing)
      const cookieStore = await cookies();
      cookieStore.set(CART_ID_KEY, cart.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return NextResponse.json({ cart }, { status: 200 });
    }

    if (action === "remove") {
      const validated = removeFromCartSchema.parse(body);
      const cart = await removeFromCart(
        validated.cartId,
        validated.lineIds
      );
      return NextResponse.json({ cart }, { status: 200 });
    }

    return NextResponse.json(
      { error: { code: "INVALID_ACTION", message: "Invalid action" } },
      { status: 400 }
    );
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

    console.error("Cart API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Failed to process cart request",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cart?cartId=... - Get cart by ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cartId = searchParams.get("cartId");

    if (!cartId) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_PARAM",
            message: "cartId query parameter is required",
          },
        },
        { status: 400 }
      );
    }

    const cart = await getCart(cartId);
    if (!cart) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Cart not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    console.error("Cart API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch cart",
        },
      },
      { status: 500 }
    );
  }
}
