"use client";

import { useEffect } from "react";
import { addToRecentlyViewed } from "@/lib/recently-viewed";

/**
 * Client component that tracks when a product is viewed
 * Adds the product handle to the recently viewed cookie
 */
export function TrackProductView({ handle }: { handle: string }) {
  useEffect(() => {
    if (handle) {
      addToRecentlyViewed(handle);
    }
  }, [handle]);

  return null; // This component doesn't render anything
}
