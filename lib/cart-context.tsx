"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Cart } from "./types";

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (lineIds: string[]) => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartId: () => string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = "shopify_cart_id";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get cart ID from localStorage
  const getCartId = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CART_ID_KEY);
  }, []);

  // Save cart ID to localStorage
  const saveCartId = useCallback((cartId: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CART_ID_KEY, cartId);
  }, []);

  // Fetch cart from API
  const fetchCart = useCallback(async (cartId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/cart?cartId=${cartId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch cart");
      }

      const data = await response.json();
      setCart(data.cart);
      return data.cart;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch cart";
      setError(errorMessage);
      console.error("Error fetching cart:", err);
      // If cart doesn't exist, clear the stored ID
      if (err instanceof Error && errorMessage.includes("not found")) {
        localStorage.removeItem(CART_ID_KEY);
        setCart(null);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new cart
  const createCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create cart");
      }

      const data = await response.json();
      const newCart = data.cart;
      saveCartId(newCart.id);
      setCart(newCart);
      return newCart;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create cart";
      setError(errorMessage);
      console.error("Error creating cart:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [saveCartId]);

  // Refresh cart from API
  const refreshCart = useCallback(async () => {
    const cartId = getCartId();
    if (!cartId) {
      // No cart exists, create one
      await createCart();
      return;
    }

    try {
      await fetchCart(cartId);
    } catch (err) {
      // If fetch fails, try creating a new cart
      console.warn("Failed to fetch existing cart, creating new one:", err);
      await createCart();
    }
  }, [getCartId, fetchCart, createCart]);

  // Remove items from cart
  const removeFromCart = useCallback(
    async (lineIds: string[]) => {
      const cartId = getCartId();
      if (!cartId) {
        throw new Error("No cart found");
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "remove",
            cartId,
            lineIds,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to remove item from cart");
        }

        const data = await response.json();
        setCart(data.cart);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove from cart";
        setError(errorMessage);
        console.error("Error removing from cart:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getCartId]
  );

  // Add item to cart
  const addToCart = useCallback(
    async (variantId: string, quantity: number = 1) => {
      try {
        setIsLoading(true);
        setError(null);

        let cartId = getCartId();

        // Create cart if it doesn't exist
        if (!cartId) {
          const newCart = await createCart();
          cartId = newCart.id;
        }

        // Add item to cart
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add",
            cartId,
            variantId,
            quantity,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to add item to cart");
        }

        const data = await response.json();
        setCart(data.cart);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to add to cart";
        setError(errorMessage);
        console.error("Error adding to cart:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getCartId, createCart]
  );

  // Load cart on mount
  useEffect(() => {
    const cartId = getCartId();
    if (cartId) {
      fetchCart(cartId).catch(() => {
        // If fetch fails, cart might be expired, create new one
        createCart();
      });
    }
  }, [getCartId, fetchCart, createCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart,
        removeFromCart,
        refreshCart,
        getCartId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
