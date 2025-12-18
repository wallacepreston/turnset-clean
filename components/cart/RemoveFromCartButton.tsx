"use client";

// @ToPresent @rendering: Client component - handles remove from cart action

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface RemoveFromCartButtonProps {
  lineId: string;
  cartId: string;
}

export function RemoveFromCartButton({ lineId, cartId }: RemoveFromCartButtonProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove",
          cartId,
          lineIds: [lineId],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

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

