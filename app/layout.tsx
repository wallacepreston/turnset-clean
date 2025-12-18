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

export const metadata: Metadata = {
  title: "TurnSet Clean",
  description: "Premium cleaning products for every space.",
};

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

