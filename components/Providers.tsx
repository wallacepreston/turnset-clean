// @ToPresent @rendering: Client component - ThemeProvider needs client-side to manage theme state and localStorage
"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/lib/cart-context";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}

