import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * A/B Testing Configuration
 * 
 * Define your A/B tests here. Each test has:
 * - name: unique identifier for the test
 * - variants: array of possible variants (e.g., ["control", "variant-a"])
 * - cookieName: name of the cookie to store the variant
 * - distribution: optional custom distribution (defaults to 50/50 split)
 */
const AB_TESTS = {
  heroCta: {
    name: "hero-cta-test",
    variants: ["control", "variant-a"] as const,
    cookieName: "ab_hero_cta",
    // Optional: custom distribution (defaults to equal split)
    // distribution: { control: 0.5, "variant-a": 0.5 },
  },
  // Add more tests here as needed
  // layout: {
  //   name: "layout-test",
  //   variants: ["standard", "compact"] as const,
  //   cookieName: "ab_layout",
  // },
} as const;

type Variant = typeof AB_TESTS[keyof typeof AB_TESTS]["variants"][number];

/**
 * Assign a variant for an A/B test
 * Uses consistent hashing based on a user identifier (IP + User-Agent)
 * to ensure the same user always gets the same variant
 */
function assignVariant(
  testName: keyof typeof AB_TESTS,
  userIdentifier: string
): Variant {
  const test = AB_TESTS[testName];
  
  // Create a simple hash from the user identifier
  let hash = 0;
  for (let i = 0; i < userIdentifier.length; i++) {
    const char = userIdentifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use hash to deterministically assign variant
  const index = Math.abs(hash) % test.variants.length;
  return test.variants[index];
}

/**
 * Get or create a user identifier for consistent variant assignment
 * Uses IP address and User-Agent to create a stable identifier
 */
function getUserIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  return `${ip}-${userAgent}`;
}

/**
 * Middleware with A/B testing functionality
 * 
 * This middleware:
 * 1. Assigns A/B test variants to users based on consistent hashing
 * 2. Stores variants in cookies for persistence across requests
 * 3. Adds variant information to response headers (for analytics)
 * 
 * Example use cases:
 * - Test different CTA button text/colors
 * - Test different homepage layouts
 * - Test different product page structures
 * - Test pricing display formats
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Get or create user identifier for consistent variant assignment
  const userIdentifier = getUserIdentifier(request);
  
  // Process each A/B test
  for (const [testKey, test] of Object.entries(AB_TESTS)) {
    const existingVariant = request.cookies.get(test.cookieName)?.value;
    
    // If user already has a variant assigned, use it (consistency)
    if (existingVariant && test.variants.includes(existingVariant as Variant)) {
      // Add variant to response headers for analytics
      response.headers.set(`x-ab-${testKey}`, existingVariant);
      // Debug log
      console.log(`[Middleware] Using existing variant "${existingVariant}" for ${test.cookieName}`);
      continue;
    }
    
    // Assign a new variant
    const variant = assignVariant(testKey as keyof typeof AB_TESTS, userIdentifier);
    
    // Store variant in cookie (expires in 30 days)
    // Explicitly set path to "/" to ensure cookie is available site-wide
    response.cookies.set(test.cookieName, variant, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Allow client-side access if needed
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    
    // Add variant to response headers for analytics
    response.headers.set(`x-ab-${testKey}`, variant);
    
    // Log assignment (in production, send to analytics service)
    console.log(
      `[Middleware] Assigned variant "${variant}" for test "${test.name}" (cookie: ${test.cookieName}) to user ${userIdentifier.slice(0, 20)}...`
    );
  }
  
  // Add request ID header (useful for debugging)
  response.headers.set("x-request-id", `req-${Date.now()}`);
  
  return response;
}

/**
 * Configure which routes the middleware runs on
 * 
 * This example runs on all routes except:
 * - Static files (images, fonts, etc.)
 * - API routes (you might want middleware there too, but this is just an example)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (optional - remove if you want middleware on API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*))",
  ],
};

