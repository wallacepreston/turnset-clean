import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/sanity";
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/components/PortableTextComponents";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// @ToPresent @rendering: Static metadata export for page-level SEO
export const metadata: Metadata = {
  title: "FAQ | TurnSet Clean",
  description: "Frequently asked questions about our cleaning products.",
};

export default async function FAQPage() {
  // @ToPresent @rendering: Fetch FAQ page content from Sanity CMS
  const pageContent = await getPageBySlug("faq");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center">
          {pageContent?.title || "Frequently Asked Questions"}
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
              FAQ entries will be fetched from Sanity CMS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
