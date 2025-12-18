"use server";
import { cookies } from 'next/headers';
import { getCart, createCart } from '@/lib/shopify';
import type { Cart } from './types';

const CART_ID_KEY = "shopify_cart_id";

/**
 * Get cart ID from cookies
 */
export async function getCartId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_KEY);
  return cartId?.value || null;
}

/**
 * Save cart ID to cookies
 */
export async function saveCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_ID_KEY, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Get cart if it exists, or return null
 */
export async function getExistingCart(): Promise<Cart | null> {
  const cartId = await getCartId();
  
  if (!cartId) {
    return null;
  }
  
  try {
    const cart = await getCart(cartId);
    return cart;
  } catch (error) {
    // Cart doesn't exist or is invalid
    console.warn('Failed to fetch existing cart:', error);
    return null;
  }
}

/**
 * Create a new cart and save the ID
 * This is a server action that can set cookies
 */
export async function createAndSaveCart(): Promise<Cart> {
  const newCart = await createCart();
  await saveCartId(newCart.id);
  return newCart;
}

/**
 * Get or create a cart
 * Returns the cart if it exists, or creates a new one
 * Note: This function cannot set cookies when called from server components.
 * Use getExistingCart() and createAndSaveCart() separately if you need cookie setting.
 */
export async function getOrCreateCart(): Promise<Cart> {
  const existingCart = await getExistingCart();
  if (existingCart) {
    return existingCart;
  }
  
  // Create a new cart (but don't save cookie - that must be done via createAndSaveCart)
  // For now, we'll just return the cart and let the client handle persistence
  return await createCart();
}

/**
 * Get cart by ID (returns null if not found)
 */
export async function getCartById(cartId: string): Promise<Cart | null> {
  try {
    return await getCart(cartId);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

