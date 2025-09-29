"use client";

import { useState, useCallback } from "react";

export function useCart(userId?: string) {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all items in cart
  const fetchCart = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cart/list?userId=${userId}`);
      const data = await res.json();
      setCart(data || []);
    } catch (err) {
      console.error("❌ Fetch cart failed:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ✅ Add / increment cart item
  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!userId) return;
    try {
      await fetch(`/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity }),
      });
      await fetchCart(); // refresh after update
    } catch (err) {
      console.error("❌ Add to cart failed:", err);
    }
  };

  // ✅ Remove cart item
  const removeFromCart = async (productId: string) => {
    if (!userId) return;
    try {
      await fetch(`/api/cart/remove?userId=${userId}&productId=${productId}`, {
        method: "DELETE",
      });
      await fetchCart(); // refresh after update
    } catch (err) {
      console.error("❌ Remove from cart failed:", err);
    }
  };

  return { cart, loading, fetchCart, addToCart, removeFromCart };
}
