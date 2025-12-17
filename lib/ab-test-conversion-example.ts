/**
 * Example: How to Track A/B Test Conversions
 * 
 * This file shows examples of where and how to track conversions
 * for your A/B tests. Copy and adapt these patterns to your actual code.
 */

import { trackABTestConversion } from "@/lib/analytics";
import { getABVariant } from "@/lib/ab-test";

/**
 * Example 1: Track conversion when user adds item to cart
 * 
 * Add this to your AddToCartButton component or cart context
 */
export function trackAddToCartConversion(productPrice: number) {
  const variant = getABVariant("ab_hero_cta", "control");
  
  trackABTestConversion(
    "hero-cta-test",
    variant,
    "add_to_cart",
    productPrice,
    {
      product_type: "cleaning_product",
    }
  );
}

/**
 * Example 2: Track conversion when user completes a purchase
 * 
 * Add this to your checkout completion page or order confirmation
 */
export function trackPurchaseConversion(orderTotal: number, orderId: string) {
  const variant = getABVariant("ab_hero_cta", "control");
  
  trackABTestConversion(
    "hero-cta-test",
    variant,
    "purchase",
    orderTotal,
    {
      order_id: orderId,
      currency: "USD",
    }
  );
}

/**
 * Example 3: Track conversion when user signs up for newsletter
 * 
 * Add this to your newsletter signup form
 */
export function trackNewsletterSignup() {
  const variant = getABVariant("ab_hero_cta", "control");
  
  trackABTestConversion(
    "hero-cta-test",
    variant,
    "newsletter_signup",
    undefined, // No monetary value
    {
      source: "homepage",
    }
  );
}

/**
 * Example 4: Track conversion when user views product page
 * (Engagement metric)
 */
export function trackProductPageView(productHandle: string) {
  const variant = getABVariant("ab_hero_cta", "control");
  
  trackABTestConversion(
    "hero-cta-test",
    variant,
    "product_view",
    undefined,
    {
      product: productHandle,
    }
  );
}

