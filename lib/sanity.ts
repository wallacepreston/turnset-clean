import { cache } from "react";
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { getSanityEnv } from "./env";
import { apiVersion } from "../sanity/env";
import type {
  HomepageContent,
  ServiceContent,
  PageContent,
} from "./types";

// Initialize Sanity client
function getSanityClient() {
  const { projectId, dataset, apiToken } = getSanityEnv();

  return createClient({
    projectId,
    dataset,
    apiVersion,
    // @ToPresent @caching: Disabled Sanity CDN to rely solely on Next.js caching (single caching layer)
    // Disable Sanity CDN to rely solely on Next.js caching (ISR)
    // This gives us full control over caching via revalidate and
    // demonstrates Next.js caching primitives for the presentation
    useCdn: false,
    token: apiToken, // for draft content
  });
}

// Image URL builder for next/image compatibility
export function urlForImage(source: any) {
  if (!source) return null;
  const client = getSanityClient();
  const imageBuilder = imageUrlBuilder(client);
  return imageBuilder.image(source);
}

/**
 * @ToPresent @caching: React cache() for request deduplication + Next.js revalidate for time-based invalidation
 * Fetch homepage content from Sanity
 * 
 * How it integrates:
 * - React cache() deduplicates calls within a single render (if called multiple times, only one API request)
 * - Next.js revalidate controls when the page regenerates, creating a new render context
 * - Together: cache() prevents duplicate requests per render, revalidate controls freshness
 */
export const getHomepageContent = cache(async (): Promise<HomepageContent | null> => {
  try {
    const client = getSanityClient();
    const query = `*[_type == "homepage"][0] {
      heroTitle,
      heroSubtitle,
      heroCtaText,
      heroCtaLink,
      testimonials[] {
        name,
        quote,
        role,
        avatar
      }
    }`;

    const content = await client.fetch<HomepageContent>(query);
    return content || null;
  } catch (error) {
    console.error("Error fetching homepage content from Sanity:", error);
    return null;
  }
});

/**
 * @ToPresent @caching: React cache() for request deduplication + Next.js revalidate for time-based invalidation
 * Fetch service-specific content by Shopify handle
 * 
 * How it integrates:
 * - React cache() deduplicates calls within a single render (if called multiple times, only one API request)
 * - Next.js revalidate controls when the page regenerates, creating a new render context
 * - Together: cache() prevents duplicate requests per render, revalidate controls freshness
 */
export const getServiceContent = cache(async (
  handle: string
): Promise<ServiceContent | null> => {
  try {
    const client = getSanityClient();
    const query = `*[_type == "servicePageContent" && serviceHandle == $handle][0] {
      serviceHandle,
      whatIsIncluded,
      bestFor[],
      beforeAfterImages[],
      faqEntries[] {
        question,
        answer
      }
    }`;

    const content = await client.fetch<ServiceContent>(query, { handle });
    return content || null;
  } catch (error) {
    console.error(
      `Error fetching service content for ${handle} from Sanity:`,
      error
    );
    return null;
  }
});

/**
 * @ToPresent @caching: React cache() for request deduplication + Next.js revalidate for time-based invalidation
 * Fetch page content by slug
 * 
 * How it integrates:
 * - React cache() deduplicates calls within a single render (if called multiple times, only one API request)
 * - Next.js revalidate controls when the page regenerates, creating a new render context
 * - Together: cache() prevents duplicate requests per render, revalidate controls freshness
 */
export const getPageBySlug = cache(async (
  slug: string
): Promise<PageContent | null> => {
  try {
    const client = getSanityClient();
    const query = `*[_type == "simplePage" && slug.current == $slug][0] {
      title,
      slug,
      content
    }`;

    const content = await client.fetch<PageContent>(query, { slug });
    return content || null;
  } catch (error) {
    console.error(`Error fetching page ${slug} from Sanity:`, error);
    return null;
  }
});

/**
 * Submit a testimonial for review
 * Requires write token (SANITY_API_TOKEN)
 */
export async function submitTestimonial(data: {
  name: string;
  email: string;
  quote: string;
  role?: string;
  avatar?: any;
}): Promise<string> {
  const client = getSanityClient();
  
  // Ensure we have a write token
  if (!client.config().token) {
    throw new Error("SANITY_API_TOKEN is required to submit testimonials");
  }

  const testimonial = {
    _type: "testimonialSubmission",
    name: data.name,
    email: data.email,
    quote: data.quote,
    role: data.role || undefined,
    avatar: data.avatar || undefined,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  const result = await client.create(testimonial);
  return result._id;
}

