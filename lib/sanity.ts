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
    useCdn: true, // Use CDN for faster responses
    token: apiToken, // Optional, for draft content
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
 * Fetch homepage content from Sanity
 */
export async function getHomepageContent(): Promise<HomepageContent | null> {
  try {
    const client = getSanityClient();
    const query = `*[_type == "homepage"][0] {
      heroTitle,
      heroSubtitle,
      heroCtaText,
      heroCtaLink,
      howItWorksSteps[] {
        title,
        description,
        icon
      },
      whoWeServe[],
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
}

/**
 * Fetch service-specific content by Shopify handle
 */
export async function getServiceContent(
  handle: string
): Promise<ServiceContent | null> {
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
}

/**
 * Fetch page content by slug
 */
export async function getPageBySlug(
  slug: string
): Promise<PageContent | null> {
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
}

