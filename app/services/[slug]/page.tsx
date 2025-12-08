import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getServiceProductByHandle } from "@/lib/shopify";
import { getServiceContent, urlForImage } from "@/lib/sanity";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/components/PortableTextComponents";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

/**
 * Generate static params for all products at build time.
 * This enables static generation of product pages while still allowing
 * on-demand generation for new products via ISR.
 */
export async function generateStaticParams() {
  try {
    const { getAllServiceProducts } = await import("@/lib/shopify");
    const products = await getAllServiceProducts();
    
    return products.map((product) => ({
      slug: product.handle,
    }));
  } catch (error) {
    console.error("Error generating static params for products:", error);
    // Return empty array to allow on-demand generation
    return [];
  }
}

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
  const [product, serviceContent] = await Promise.all([
    getServiceProductByHandle(slug),
    getServiceContent(slug),
  ]);

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

        {/* What's Included Section */}
        {serviceContent?.whatIsIncluded && (
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <PortableText
                  value={serviceContent.whatIsIncluded}
                  components={portableTextComponents}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Best For Section */}
        {serviceContent?.bestFor && serviceContent.bestFor.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Best For</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {serviceContent.bestFor.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Before/After Images */}
        {serviceContent?.beforeAfterImages &&
          serviceContent.beforeAfterImages.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Before & After</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceContent.beforeAfterImages.map((image, index) => {
                  const imageUrl = urlForImage(image)?.url();
                  if (!imageUrl) return null;

                  return (
                    <div
                      key={index}
                      className="relative w-full h-64 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={imageUrl}
                        alt={image.alt || `Before/After ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* FAQ Section */}
        {serviceContent?.faqEntries && serviceContent.faqEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {serviceContent.faqEntries.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold text-lg">{faq.question}</h3>
                    {faq.answer && (
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        <PortableText
                          value={faq.answer}
                          components={portableTextComponents}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
