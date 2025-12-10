import { getHomepageContent } from "@/lib/sanity";
import { getAllServiceProducts } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/lib/sanity";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
            "Professional cleaning services. Trusted by homeowners, businesses, remote hosts, landlords, and property managers."}
        </p>
        {homepageContent?.heroCtaText && (
          <Button size="lg" asChild>
            <a href={homepageContent.heroCtaLink || "/services"}>
              {homepageContent.heroCtaText}
            </a>
          </Button>
        )}
      </div>

      {/* How It Works Section */}
      {homepageContent?.howItWorksSteps &&
        homepageContent.howItWorksSteps.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {homepageContent.howItWorksSteps.map((step, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="text-4xl font-bold text-primary">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Who We Serve Section */}
      {homepageContent?.whoWeServe && homepageContent.whoWeServe.length > 0 && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Who We Serve</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {homepageContent.whoWeServe.map((segment, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground"
              >
                {segment}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Featured Services Section */}
      {featured.length > 0 && (
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular cleaning services
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product) => (
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
                    {product.description || "Professional cleaning service"}
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
                    {/* @ToPresent @rendering: next/link for client-side navigation with automatic prefetching */}
                    <Link href={`/services/${product.handle}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              {/* @ToPresent: next/link for client-side navigation with automatic prefetching */}
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
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
