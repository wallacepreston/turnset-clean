import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";

const geist = Geist({
  subsets: ["latin",],
});

// @ToPresent @rendering: Static metadata export for root layout SEO
export const metadata: Metadata = {
  title: "TurnSet Clean",
  description: "Premium cleaning products for every space.",
};

// @ToPresent @rendering: Root layout is a Server Component by default (all pages are Server Components)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <Providers>
          <Suspense fallback={<div className="h-16 border-b" />}>
            <Header />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Suspense fallback={<div className="border-t py-8" />}>
            <Footer />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}

