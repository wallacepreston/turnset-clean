"use server";
import { cookies } from 'next/headers'

/**
 * localStorage utility for managing recently viewed products
 * Stores product handles (slugs) in localStorage as a JSON array
 * 
 * Uses localStorage instead of cookies for:
 * - Consistency with cart storage
 * - Simpler API (no cookie parsing)
 * - More storage space
 * - Better privacy (not sent with requests)
 */

const RECENTLY_VIEWED_KEY = "recently_viewed";
const MAX_RECENT_ITEMS = 3; // Store up to 3 recently viewed items

/**
 * Get recently viewed product handles from localStorage
 */
export async function getRecentlyViewed(): Promise<string[]> {
    const cookieStore = await cookies()
    const recentlyViewed = cookieStore.get(RECENTLY_VIEWED_KEY);
    if (!recentlyViewed) {
      return [];
    }
    const recentlyViewedItems = JSON.parse(recentlyViewed.value);
    console.log("recentlyViewedItems", recentlyViewedItems);
    return recentlyViewedItems;
}

/**
 * Add a product handle to recently viewed
 * Removes duplicates and keeps only the most recent items
 */

export async function addToRecentlyViewed(handle: string): Promise<void> {
  try {
    const current = await getRecentlyViewed();
    
    // Remove the handle if it already exists (to move it to the front)
    const filtered = current.filter((h) => h !== handle);
    
    // Add the new handle to the front
    const updated = [handle, ...filtered].slice(0, MAX_RECENT_ITEMS);
    
    // Save to localStorage
    const cookieStore = await cookies()
    cookieStore.set(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating recently viewed in localStorage:", error);
  }
}
