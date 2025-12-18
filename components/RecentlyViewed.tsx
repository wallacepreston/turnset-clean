// @ToPresent @rendering: Server component - fetches recently viewed products from cookies and Shopify

import Link from "next/link";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { getServiceProductByHandle } from "@/lib/shopify";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";

/**
 * Server component that displays recently viewed products
 * Falls back to featured products if no recently viewed items exist
 */
export async function RecentlyViewed({ featuredProducts }: { featuredProducts: Product[] }) {
  // Get recently viewed handles from cookies
  const recentlyViewedHandles = await getRecentlyViewed();
  
  // Fetch products for recently viewed handles
  let recentlyViewedProducts: Product[] = [];
  if (recentlyViewedHandles.length > 0) {
    const products = await Promise.all(
      recentlyViewedHandles.map(async (handle) => {
        try {
          return await getServiceProductByHandle(handle);
        } catch (error) {
          console.error(`Error fetching product ${handle}:`, error);
          return null;
        }
      })
    );
    // Filter out nulls (products that don't exist or failed to fetch)
    recentlyViewedProducts = products.filter(
      (p): p is Product => p !== null
    );
  }

  // Use recently viewed products if available, otherwise fall back to featured
  const productsToShow = recentlyViewedProducts.length > 0 
    ? recentlyViewedProducts 
    : featuredProducts;

  // Don't render if no products
  if (productsToShow.length === 0) {
    return null;
  }

  const hasRecentlyViewed = recentlyViewedProducts.length > 0;
  const title = hasRecentlyViewed
    ? "Continue Where You Left Off"
    : "Featured Products";
  const subtitle = hasRecentlyViewed
    ? "Pick up where you left off with these products you recently viewed"
    : "Shop best-sellers in cleaners, tools, and merch";

  // Center items when there are 1-2 products
  const itemCount = productsToShow.length;
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
        {productsToShow.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className={itemCount <= 2 ? "max-w-sm" : ""}
          />
        ))}
      </div>
      <div className="text-center mt-8">
        <Button variant="outline" asChild>
          <Link href="/products">View Our Products</Link>
        </Button>
      </div>
    </div>
  );
}
