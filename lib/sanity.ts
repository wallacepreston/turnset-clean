import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { getSanityEnv } from "./env";
import { apiVersion } from "../sanity/env";
import type {
  HomepageContent,
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
    // Caching is now handled by cacheComponents with cacheLife() and cacheTag() in the data fetching functions
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
 * @ToPresent @caching: cacheComponents with cacheLife for ISR + cacheTag for on-demand revalidation
 * Fetch homepage content from Sanity
 * 
 * How it integrates with cacheComponents:
 * - 'use cache' directive enables component-level caching
 * - cacheLife('hours') provides ISR with 1-hour revalidation (content changes infrequently)
 * - cacheTag('sanity-homepage') allows on-demand invalidation via webhooks
 * - React cache() still deduplicates calls within a single render
 */
export const getHomepageContent = cache(async (): Promise<HomepageContent | null> => {
  'use cache';
  cacheLife('hours'); // ISR: revalidate every hour (content changes infrequently)
  cacheTag('sanity-homepage'); // Tag for on-demand revalidation via webhooks

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
    // Silently handle prerendering errors - they're expected during static generation
    // and will be retried on the next request
    if (
      error instanceof Error &&
      (error.message.includes("prerender") ||
        error.message.includes("HANGING_PROMISE_REJECTION"))
    ) {
      return null;
    }
    console.error("Error fetching homepage content from Sanity:", error);
    return null;
  }
});

/**
 * @ToPresent @caching: cacheComponents with cacheLife for ISR + cacheTag for on-demand revalidation
 * Fetch page content by slug
 * 
 * How it integrates with cacheComponents:
 * - 'use cache' directive enables component-level caching
 * - cacheLife('hours') provides ISR with 1-hour revalidation (CMS content changes infrequently)
 * - cacheTag('sanity-page', slug) allows targeted on-demand invalidation per page
 * - React cache() still deduplicates calls within a single render
 */
export const getPageBySlug = cache(async (
  slug: string
): Promise<PageContent | null> => {
  'use cache';
  cacheLife('hours'); // ISR: revalidate every hour (CMS content changes infrequently)
  cacheTag('sanity-page', `sanity-page-${slug}`); // Tag for on-demand revalidation

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
    // Silently handle prerendering errors - they're expected during static generation
    // and will be retried on the next request
    if (
      error instanceof Error &&
      (error.message.includes("prerender") ||
        error.message.includes("HANGING_PROMISE_REJECTION"))
    ) {
      return null;
    }
    console.error(`Error fetching page ${slug} from Sanity:`, error);
    return null;
  }
});

