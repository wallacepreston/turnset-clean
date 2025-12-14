import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

/**
 * Reusable skeleton component for product cards
 * Matches the structure of product cards used throughout the app
 */
export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col">
      {/* Image skeleton */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-xl bg-muted/20 animate-pulse" />
      
      <CardHeader>
        {/* Title skeleton */}
        <div className="h-6 bg-muted/20 rounded animate-pulse w-3/4 mb-2" />
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-muted/20 rounded animate-pulse w-full" />
          <div className="h-4 bg-muted/20 rounded animate-pulse w-5/6" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        {/* Price skeleton */}
        <div className="h-7 bg-muted/20 rounded animate-pulse w-20" />
      </CardContent>
      
      <CardFooter>
        {/* Button skeleton */}
        <div className="h-10 bg-muted/20 rounded animate-pulse w-full" />
      </CardFooter>
    </Card>
  );
}
