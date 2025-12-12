import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllServiceProducts } from "@/lib/shopify";
import type { Product } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// @ToPresent @rendering: Static metadata export for page-level SEO
export const metadata: Metadata = {
  title: "Products | TurnSet Clean",
  description: "Shop premium cleaning products, tools, and merch.",
};

// @ToPresent @caching: ISR with 60-second revalidation for product listings (pricing changes more frequently)
export const revalidate = 60; // Revalidate every 60 seconds (ISR)

// @ToPresent @rendering: Server Component - data fetching happens on server, zero client JS for data
export default async function ProductsPage() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await getAllServiceProducts();
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Failed to load products. Please check your Shopify configuration.";
    products = [];
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Shop Products</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stock up on cleaners, detergents, tools, and TurnSet Clean merch.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-dashed border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Please configure SHOPIFY_STOREFRONT_API_URL and
              SHOPIFY_STOREFRONT_API_TOKEN in your environment variables.
            </p>
          </div>
        )}

        {products.length === 0 && !error && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No products available
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon for restocks and new drops.
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                {product.featuredImage && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                    {/* @ToPresent @rendering: next/image for automatic image optimization and lazy loading */}
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
                  {product.variants.length > 1 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.variants.length} variants available
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    {/* @ToPresent @rendering: next/link for client-side navigation with automatic prefetching */}
                    <Link href={`/products/${product.handle}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
