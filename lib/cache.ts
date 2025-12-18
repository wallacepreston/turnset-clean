'use cache';
import { cacheLife, cacheTag } from 'next/cache';

export async function getCacheTimestamp() {
  cacheTag('footer-data'); // Tag the cache entry for on-demand revalidation
  cacheLife('hours'); // Cache the result for 1 hour (SWR behavior)

  // This will be executed only when the cache is stale or empty
  const year = new Date().getFullYear();
  return year;
}