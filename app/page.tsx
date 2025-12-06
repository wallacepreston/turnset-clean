import { getHomepageContent } from "@/lib/sanity";
import { Button } from "@/components/ui/button";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import { urlForImage } from "@/lib/sanity";

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

export default async function Home() {
  const homepageContent = await getHomepageContent();

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
