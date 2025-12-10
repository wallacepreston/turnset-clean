import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/sanity";
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/components/PortableTextComponents";

// @ToPresent @caching: ISR with 10-minute revalidation for static marketing content
export const revalidate = 600; // Revalidate every 10 minutes (ISR)

// @ToPresent @rendering: Static metadata export for page-level SEO
export const metadata: Metadata = {
  title: "About | TurnSet Clean",
  description: "Learn more about TurnSet Clean and our mission.",
};

export default async function AboutPage() {
  // @ToPresent @rendering: Fetch about page content from Sanity CMS
  const pageContent = await getPageBySlug("about");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold">
          {pageContent?.title || "About TurnSet Clean"}
        </h1>
        {pageContent?.content ? (
          <div className="prose prose-lg max-w-none">
            <PortableText
              value={pageContent.content}
              components={portableTextComponents}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              Content coming soon
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              About page content will be fetched from Sanity CMS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
