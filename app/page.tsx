import { getHomepageContent } from "@/lib/sanity";
import { getAllServiceProducts } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { urlForImage } from "@/lib/sanity";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { Suspense } from "react";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";

const LoadingSkeleton = () => {
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
  )
}

// @ToPresent @rendering: Server Component - data fetching happens on server, zero client JS for data
export default async function Home() {
  // @ToPresent @rendering: Parallel data fetching from multiple sources (Sanity + Shopify) using Promise.all()
  // Fetch data from both Sanity (content) and Shopify (products)
  // This demonstrates multi-source data fetching with proper caching
  const [homepageContent, featuredProducts] = await Promise.all([
    getHomepageContent(),
    getAllServiceProducts().catch(() => []), // Gracefully handle Shopify errors
  ]);

  // Show first 3 products as featured
  const featured = featuredProducts.slice(0, 3);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-8 mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {homepageContent?.heroTitle || "TurnSet Clean"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {homepageContent?.heroSubtitle ||
            "Premium cleaning products and tools—trusted by homeowners, hosts, landlords, and property managers."}
        </p>
        {homepageContent?.heroCtaText && (
          <Button size="lg" asChild>
            <a href={homepageContent.heroCtaLink || "/products"}>
              {homepageContent.heroCtaText}
            </a>
          </Button>
        )}
      </div>

      {/* Recently Viewed / Featured Products Section */}
      {/* @ToPresent @rendering: RecentlyViewed is a Client Component (needs localStorage access)
          - Server Component (Home) renders static HTML for hero/testimonials
          - Client Component boundary: RecentlyViewed and its children (ProductCard) get hydrated
          - ProductCard HTML is still server-rendered, but hydrated on client for interactivity
          - This allows dynamic behavior (recently viewed from localStorage) while keeping most content static */}
        <Suspense fallback={<LoadingSkeleton/>}>
          <RecentlyViewed featuredProducts={featured} />
        </Suspense>
      
    </div>
  );
}
