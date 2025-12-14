"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";

/**
 * Client component that displays recently viewed products
 * Falls back to featured products if no recently viewed items exist
 */
export function RecentlyViewed({ featuredProducts }: { featuredProducts: Product[] }) {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecentlyViewed() {
      try {
        setIsLoading(true);
        const handles = getRecentlyViewed();

        if (handles.length === 0) {
          // No recently viewed items, use featured products
          setRecentlyViewed(featuredProducts.slice(0, 3));
          setIsLoading(false);
          return;
        }

        // Fetch products for recently viewed handles via API
        const response = await fetch("/api/products/by-handles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(handles),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recently viewed products");
        }

        const data = await response.json();
        const validProducts = (data.products as Product[]).slice(0, 3);

        if (validProducts.length > 0) {
          setRecentlyViewed(validProducts);
        } else {
          // Fallback to featured if no valid recently viewed products
          setRecentlyViewed(featuredProducts.slice(0, 3));
        }
      } catch (error) {
        console.error("Error loading recently viewed:", error);
        // Fallback to featured products on error
        setRecentlyViewed(featuredProducts.slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    }

    loadRecentlyViewed();
  }, [featuredProducts]);

  // Show skeletons while loading
  if (isLoading) {
    return (
      <div className="mb-16">
        <div className="text-center mb-12">
          <div className="h-9 bg-muted/20 rounded animate-pulse w-64 mx-auto mb-4" />
          <div className="h-5 bg-muted/20 rounded animate-pulse w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </div>
    );
  }

  // Don't render if no products
  if (recentlyViewed.length === 0) {
    return null;
  }

  const hasRecentlyViewed = getRecentlyViewed().length > 0;
  const title = hasRecentlyViewed
    ? "Continue Where You Left Off"
    : "Featured Products";
  const subtitle = hasRecentlyViewed
    ? "Pick up where you left off with these products you recently viewed"
    : "Shop best-sellers in cleaners, tools, and merch";

  // Center items when there are 1-2 products
  const itemCount = recentlyViewed.length;
  const containerClasses =
    itemCount <= 2
      ? "flex flex-wrap justify-center gap-6"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
      </div>
      <div className={containerClasses}>
        {recentlyViewed.map((product) => (
          <Card key={product.id} className={`flex flex-col ${itemCount <= 2 ? "max-w-sm" : ""}`}>
            {product.featuredImage && (
              <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || product.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle>{product.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {product.description || "Premium cleaning product"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: product.priceRange.minVariantPrice.currencyCode,
                }).format(
                  parseFloat(product.priceRange.minVariantPrice.amount)
                )}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/products/${product.handle}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center mt-8">
        <Button variant="outline" asChild>
          <Link href="/products">View All Products</Link>
        </Button>
      </div>
    </div>
  );
}
