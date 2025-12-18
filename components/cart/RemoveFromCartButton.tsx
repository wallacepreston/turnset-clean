"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";

interface RemoveFromCartButtonProps {
  lineId: string;
  cartId: string;
}

export function RemoveFromCartButton({ lineId, cartId }: RemoveFromCartButtonProps) {
  const router = useRouter();
  const { removeFromCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      // Use the cart context method which updates the context state
      await removeFromCart([lineId]);
      // Refresh the page to show updated cart
      router.refresh();
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Failed to remove item. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRemove}
      disabled={isRemoving}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
      aria-label="Remove item"
    >
      {
        isRemoving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )
      }
    </Button>
  );
}

