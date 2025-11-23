import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TurnSet Clean",
  description: "Professional cleaning services for rental properties",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

