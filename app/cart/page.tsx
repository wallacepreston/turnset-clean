// @ToPresent @rendering: Cart page is a client-side React component that uses the useCart hook to manage the cart state
"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";

// Skeleton component for cart items
function CartItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Image skeleton */}
          <div className="w-24 h-24 rounded-lg bg-muted/20 animate-pulse flex-shrink-0" />
          {/* Content skeleton */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Title skeleton */}
            <div className="h-6 bg-muted/20 rounded animate-pulse w-3/4" />
            {/* Variant skeleton */}
            <div className="h-4 bg-muted/20 rounded animate-pulse w-1/2" />
            {/* Bottom row skeleton */}
            <div className="flex items-center justify-between mt-2">
              <div className="h-4 bg-muted/20 rounded animate-pulse w-20" />
              <div className="flex items-center gap-4">
                <div className="h-5 bg-muted/20 rounded animate-pulse w-16" />
                <div className="w-8 h-8 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton component for order summary
function OrderSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-muted/20 rounded animate-pulse w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <div className="h-4 bg-muted/20 rounded animate-pulse w-16" />
          <div className="h-4 bg-muted/20 rounded animate-pulse w-20" />
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <div className="h-5 bg-muted/20 rounded animate-pulse w-12" />
            <div className="h-5 bg-muted/20 rounded animate-pulse w-20" />
          </div>
        </div>
        <div className="h-11 bg-muted/20 rounded animate-pulse w-full" />
        <div className="h-11 bg-muted/20 rounded animate-pulse w-full" />
      </CardContent>
    </Card>
  );
}

export default function CartPage() {
  const { cart, isLoading, error, refreshCart, removeFromCart } = useCart();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header skeleton */}
          <div>
            <div className="h-9 bg-muted/20 rounded animate-pulse w-48 mb-2" />
            <div className="h-5 bg-muted/20 rounded animate-pulse w-24" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <CartItemSkeleton />
              <CartItemSkeleton />
            </div>

            {/* Order Summary Skeleton */}
            <div className="lg:col-span-1">
              <OrderSummarySkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Cart</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshCart} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cart || cart.totalQuantity === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cart.cost.totalAmount.currencyCode,
  }).format(parseFloat(cart.cost.totalAmount.amount));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.lines.edges.map(({ node: line }) => {
              const productImage = line.merchandise.product.featuredImage;
              const linePrice = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: line.merchandise.price.currencyCode,
              }).format(parseFloat(line.merchandise.price.amount));

              const handleRemove = async () => {
                try {
                  await removeFromCart([line.id]);
                } catch (error) {
                  console.error("Failed to remove item:", error);
                }
              };

              return (
                <Card key={line.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {productImage && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={productImage.url}
                            alt={productImage.altText || line.merchandise.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${line.merchandise.product.handle}`}
                          className="hover:underline"
                        >
                          <h3 className="font-semibold text-lg">
                            {line.merchandise.product.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {line.merchandise.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Quantity: {line.quantity}
                          </p>
                          <div className="flex items-center gap-4">
                            <p className="font-semibold">{linePrice}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemove}
                              disabled={isLoading}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{totalPrice}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{totalPrice}</span>
                  </div>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="w-full"
                  disabled={!cart.checkoutUrl}
                >
                  <a
                    href={cart.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Proceed to Checkout
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
