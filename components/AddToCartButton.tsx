"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, Loader2, Check } from "lucide-react";

interface AddToCartButtonProps {
  variantId: string;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function AddToCartButton({
  variantId,
  disabled = false,
  className,
  size = "lg",
}: AddToCartButtonProps) {
  const { addToCart, isLoading } = useCart();
  const [success, setSuccess] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const handleAddToCart = async () => {
    try {
      setLocalLoading(true);
      setSuccess(false);
      await addToCart(variantId, 1);
      setSuccess(true);
      // Reset success state after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // Error is handled by cart context
    } finally {
      setLocalLoading(false);
    }
  };

  const isButtonLoading = isLoading || localLoading;

  return (
    <Button
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={disabled || isButtonLoading}
    >
      {isButtonLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : success ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
