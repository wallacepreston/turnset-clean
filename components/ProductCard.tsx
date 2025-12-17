import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProductCardProps {
  product: Product;
  className?: string;
}

/**
 * Reusable product card component
 * Entire card is clickable and navigates to product detail page
 * 
 * @ToPresent @rendering: Server Component - renders as static HTML when used in Server Components
 * - When used in app/products/page.tsx (Server Component with ISR): Rendered on server as static HTML
 * - When used in RecentlyViewed (Client Component): Rendered on server, then hydrated on client
 * - Hover effects are CSS-only (no JavaScript required)
 * - Link component handles client-side navigation without full page reload
 */
export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className={`block ${className || ""}`}
      prefetch={false}
    >
      <Card className="flex flex-col h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        {product.featuredImage && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{product.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {product.description || "Premium cleaning product"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: product.priceRange.minVariantPrice.currencyCode,
            }).format(parseFloat(product.priceRange.minVariantPrice.amount))}
          </p>
          {product.variants.length > 1 && (
            <p className="text-sm text-muted-foreground mt-1">
              {product.variants.length} variants available
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="default">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
