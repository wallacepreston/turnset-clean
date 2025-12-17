"use client";

import { useEffect } from "react";
import { useABVariant } from "@/lib/ab-test";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trackABTestView, trackABTestEvent } from "@/lib/analytics";

const TEST_NAME = "hero-cta-test";

/**
 * Example A/B Test Component
 * 
 * This demonstrates how to use A/B testing in a Client Component.
 * The variant is assigned in middleware and stored in a cookie,
 * so each user consistently sees the same variant.
 * 
 * In this example:
 * - Control: "Shop Now" button
 * - Variant A: "Get Started" button with different styling
 * 
 * To use this in a Server Component, use getABVariantServer() instead.
 */
export function ABTestExample() {
  // Get the variant assigned by middleware
  const variant = useABVariant("ab_hero_cta", "control");

  // Track view when component mounts (impression tracking)
  useEffect(() => {
    trackABTestView(TEST_NAME, variant, {
      page: "/",
      component: "hero-cta",
    });
  }, [variant]);

  // Track click event
  const handleClick = () => {
    trackABTestEvent(TEST_NAME, variant, "click", {
      buttonText: variant === "variant-a" ? "Get Started" : "Shop Now",
      destination: "/products",
    });
  };

  // Debug: Log variant (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log("[A/B Test] Current variant:", variant);
    console.log("[A/B Test] To test other variant, run in console:");
    console.log('  document.cookie = "ab_hero_cta=variant-a; path=/; max-age=2592000"; location.reload();');
  }

  if (variant === "variant-a") {
    return (
      <Button
        size="lg"
        className="bg-gradient-to-r from-primary to-secondary"
        asChild
        onClick={handleClick}
      >
        <Link href="/products">Get Started</Link>
      </Button>
    );
  }

  // Default/control variant
  return (
    <Button size="lg" asChild onClick={handleClick}>
      <Link href="/products">Shop Now</Link>
    </Button>
  );
}

