/**
 * A/B Test Analytics Utilities
 * 
 * This module provides functions to track A/B test events and conversions.
 * 
 * Integration options:
 * 1. Google Analytics 4 (GA4) - use gtag()
 * 2. Plausible Analytics - use plausible()
 * 3. Custom analytics API - use trackEvent()
 * 4. Console logging (development)
 * 
 * Example usage:
 * ```tsx
 * trackABTestEvent('hero-cta-test', 'control', 'click');
 * trackABTestConversion('hero-cta-test', 'variant-a', 'purchase', { value: 29.99 });
 * ```
 */

export interface ABTestEvent {
  testName: string;
  variant: string;
  eventType: "view" | "click" | "conversion" | "custom";
  metadata?: Record<string, unknown>;
}

/**
 * Track an A/B test event
 * 
 * @param testName - Name of the A/B test (e.g., "hero-cta-test")
 * @param variant - Variant that triggered the event (e.g., "control", "variant-a")
 * @param eventType - Type of event ("view", "click", "conversion", or "custom")
 * @param metadata - Optional metadata (e.g., { buttonText: "Shop Now", page: "/" })
 */
export function trackABTestEvent(
  testName: string,
  variant: string,
  eventType: ABTestEvent["eventType"] = "click",
  metadata?: Record<string, unknown>
): void {
  if (typeof window === "undefined") {
    return; // Server-side, skip tracking
  }

  const event: ABTestEvent = {
    testName,
    variant,
    eventType,
    metadata,
  };

  // Development: Log to console
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics] A/B Test Event:", event);
  }

  // Google Analytics 4 (if gtag is available)
  if (typeof window !== "undefined" && "gtag" in window) {
    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) {
      gtag("event", `ab_test_${eventType}`, {
        test_name: testName,
        variant: variant,
        event_category: "A/B Test",
        ...metadata,
      });
    }
  }

  // Plausible Analytics (if plausible is available)
  if (typeof window !== "undefined" && "plausible" in window) {
    const plausible = (window as { plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void }).plausible;
    if (plausible) {
      plausible(`AB Test: ${testName} - ${eventType}`, {
        props: {
          test: testName,
          variant: variant,
          ...metadata,
        },
      });
    }
  }

  // Custom analytics API (optional - uncomment to use)
  // trackEventToAPI(event).catch(console.error);
}

/**
 * Track an A/B test conversion (e.g., purchase, signup, form submission)
 * 
 * @param testName - Name of the A/B test
 * @param variant - Variant that led to conversion
 * @param conversionType - Type of conversion (e.g., "purchase", "signup")
 * @param value - Optional conversion value (e.g., purchase amount)
 * @param metadata - Additional metadata
 */
export function trackABTestConversion(
  testName: string,
  variant: string,
  conversionType: string,
  value?: number,
  metadata?: Record<string, unknown>
): void {
  trackABTestEvent(testName, variant, "conversion", {
    conversion_type: conversionType,
    value,
    ...metadata,
  });
}

/**
 * Track A/B test view (when variant is displayed)
 * Useful for tracking impressions
 */
export function trackABTestView(
  testName: string,
  variant: string,
  metadata?: Record<string, unknown>
): void {
  trackABTestEvent(testName, variant, "view", metadata);
}

/**
 * Send event to custom analytics API
 * Uncomment and configure if you want to store events in your own database
 */
/*
async function trackEventToAPI(event: ABTestEvent): Promise<void> {
  try {
    await fetch("/api/analytics/ab-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.error("Failed to track event to API:", error);
  }
}
*/

