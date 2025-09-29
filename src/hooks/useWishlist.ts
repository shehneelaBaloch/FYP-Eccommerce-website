"use client";

import { useEffect, useState } from "react";

interface WishlistItem {
  _id?: string;
  userId: string;
  productId: any;
}

export function useWishlist(userId?: string) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch wishlist
  const fetchWishlist = async () => {
    if (!userId) return;
    setLoading(true);
    const res = await fetch(`/api/wishlist/list?userId=${userId}`);
    const data = await res.json();
    setWishlist(data);
    setLoading(false);
  };

  // 🔹 Toggle product in wishlist
  const toggleWishlist = async (productId: string) => {
    if (!userId) return;
    await fetch("/api/wishlist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    });
    fetchWishlist();
  };

  useEffect(() => {
    fetchWishlist();
  }, [userId]);

  return { wishlist, loading, toggleWishlist, fetchWishlist };
}
