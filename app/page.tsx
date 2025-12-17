import { getHomepageContent } from "@/lib/sanity";
import { getAllServiceProducts } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { urlForImage } from "@/lib/sanity";
import { RecentlyViewed } from "@/components/RecentlyViewed";

// @ToPresent @caching: ISR with 5-minute revalidation for homepage (balances freshness with performance)
export const revalidate = 300; // Revalidate every 5 minutes (ISR)

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
          <Button size="lg" asChild className="bg-gradient-to-r from-primary to-secondary">
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
      {featured.length > 0 && (
        <RecentlyViewed featuredProducts={featured} />
      )}

      {/* Testimonials Section */}
      {homepageContent?.testimonials &&
        homepageContent.testimonials.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-12">
              What Our Clients Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {homepageContent.testimonials.map((testimonial, index) => {
                const imageUrl = testimonial.avatar
                  ? urlForImage(testimonial.avatar)?.url()
                  : null;

                return (
                  <div
                    key={index}
                    className="p-6 rounded-lg border bg-card space-y-4"
                  >
                    {testimonial.quote && (
                      <p className="text-muted-foreground italic">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={testimonial.name || "Testimonial"}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        {testimonial.role && (
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}
