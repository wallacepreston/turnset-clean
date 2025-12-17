"use client";

/**
 * A/B Testing Utilities
 * 
 * Client-side utilities to read A/B test variants from cookies
 * and conditionally render different UI based on the variant.
 * 
 * Note: Variants are assigned in middleware and stored in cookies,
 * so they persist across page loads and are consistent per user.
 */

/**
 * Get the A/B test variant for a specific test from cookies
 * 
 * @param cookieName - The cookie name for the test (e.g., "ab_hero_cta")
 * @param defaultValue - Default variant if cookie is not found
 * @returns The variant string or defaultValue
 */
export function getABVariant(
  cookieName: string,
  defaultValue: string = "control"
): string {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  // Read cookie value
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((c) => c.startsWith(`${cookieName}=`));
  
  if (!cookie) {
    return defaultValue;
  }

  const value = cookie.split("=")[1];
  return value || defaultValue;
}

/**
 * React hook to get A/B test variant (for Client Components)
 * 
 * @example
 * ```tsx
 * 'use client';
 * const variant = useABVariant("ab_hero_cta", "control");
 * return variant === "variant-a" ? <NewCTA /> : <OldCTA />;
 * ```
 */
export function useABVariant(
  cookieName: string,
  defaultValue: string = "control"
): string {
  // Simple implementation - reads cookie on mount
  // For more complex scenarios, you could use useState/useEffect
  // to react to cookie changes, but for A/B tests, the variant
  // is typically set once and doesn't change
  if (typeof window === "undefined") {
    return defaultValue;
  }

  return getABVariant(cookieName, defaultValue);
}

/**
 * Server-side utility to read A/B test variant from cookies
 * Use this in Server Components or API routes
 * 
 * @example
 * ```tsx
 * import { cookies } from "next/headers";
 * const cookieStore = await cookies();
 * const variant = getABVariantServer("ab_hero_cta", cookieStore);
 * ```
 */
export function getABVariantServer(
  cookieName: string,
  cookieStore: Awaited<ReturnType<typeof import("next/headers").cookies>>
): string {
  const cookie = cookieStore.get(cookieName);
  return cookie?.value || "control";
}

