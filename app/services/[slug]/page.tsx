import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getServiceProductByHandle } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getServiceProductByHandle(slug);

  if (!product) {
    return {
      title: "Service Not Found | TurnSet Clean",
    };
  }

  return {
    title: `${product.title} | TurnSet Clean`,
    description: product.description || "Professional cleaning service",
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getServiceProductByHandle(slug);

  if (!product) {
    notFound();
  }

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.priceRange.minVariantPrice.currencyCode,
  }).format(parseFloat(product.priceRange.minVariantPrice.amount));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          {product.featuredImage && (
            <div className="relative w-full h-96 lg:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                {product.title}
              </h1>
              <p className="text-2xl font-semibold text-primary mb-6">{price}</p>
              {product.description && (
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Options</CardTitle>
                  <CardDescription>
                    Choose from available service options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{variant.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: variant.price.currencyCode,
                            }).format(parseFloat(variant.price.amount))}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            variant.availableForSale
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {variant.availableForSale ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button size="lg" className="w-full">
              Book Now
            </Button>
          </div>
        </div>

        {/* Sanity Content Placeholder */}
        <div className="mt-12 rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            TODO: Connect to Sanity
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Service-specific content (what&apos;s included, FAQs) will be
            fetched from Sanity CMS
          </p>
        </div>
      </div>
    </div>
  );
}

