"use client";

import dynamic from "next/dynamic";

/**
 * Dynamically import AIChatWidget for code splitting and performance
 * - Reduces initial bundle size (chat widget only loads when needed)
 * - Prevents SSR since the widget is fully interactive and client-side only
 * - Improves initial page load performance
 */
const AIChatWidget = dynamic(
  () => import("@/components/AIChatWidget").then((mod) => mod.AIChatWidget),
  { ssr: false }
);

export function AIChatWidgetWrapper() {
  return <AIChatWidget />;
}

