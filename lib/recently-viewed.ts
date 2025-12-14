"use client";

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
export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string");
    }

    return [];
  } catch (error) {
    console.error("Error reading recently viewed from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    return [];
  }
}

/**
 * Add a product handle to recently viewed
 * Removes duplicates and keeps only the most recent items
 */
export function addToRecentlyViewed(handle: string): void {
  if (typeof window === "undefined") return;

  try {
    const current = getRecentlyViewed();
    
    // Remove the handle if it already exists (to move it to the front)
    const filtered = current.filter((h) => h !== handle);
    
    // Add the new handle to the front
    const updated = [handle, ...filtered].slice(0, MAX_RECENT_ITEMS);
    
    // Save to localStorage
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating recently viewed in localStorage:", error);
  }
}

/**
 * Clear recently viewed products
 */
export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error("Error clearing recently viewed from localStorage:", error);
  }
}
