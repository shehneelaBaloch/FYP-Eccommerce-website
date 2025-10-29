"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Zap, X, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProductGridProps {
  title: string;
  products: Product[];
  showViewAll?: boolean;
}

export default function ProductGrid({
  title,
  products,
  showViewAll = true,
}: ProductGridProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null); // ❤️ Loader for Buy Now

  const userId = session?.user?.id;

  // ✅ Fetch user wishlist
  useEffect(() => {
    async function fetchWishlist() {
      if (!userId) return;
      try {
        const res = await fetch(`/api/wishlist/list?userId=${userId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const productIds = data.map(
            (item: any) => item.productId?._id || item.productId
          );
          setWishlist(productIds);
        }
      } catch (err) {
        console.error("❌ Error fetching wishlist:", err);
      }
    }
    if (session) fetchWishlist();
  }, [session, userId]);

  // ✅ Add to Cart
  const addToCart = async (productId: string, quantity = 1) => {
    if (!session) return router.push("/login");

    if (!userId) {
      setToast({ message: "❌ User ID missing!", type: "error" });
      return;
    }

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: "✅ Added to cart!", type: "success" });
      } else {
        setToast({
          message: "❌ Failed: " + (data.error || "Unknown error"),
          type: "error",
        });
      }
    } catch (err) {
      setToast({ message: "❌ Add to cart failed!", type: "error" });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  // ✅ Toggle Wishlist
  const toggleWishlist = async (productId: string) => {
    if (!session) return router.push("/login");

    if (!userId) {
      setToast({ message: "❌ User ID missing!", type: "error" });
      return;
    }

    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.removed) {
          setWishlist(wishlist.filter((id) => id !== productId));
          setToast({ message: "💔 Removed from wishlist", type: "success" });
        } else {
          setWishlist([...wishlist, productId]);
          setToast({ message: "❤️ Added to wishlist", type: "success" });
        }
      } else {
        setToast({ message: "❌ Wishlist update failed", type: "error" });
      }
    } catch (err) {
      console.error("❌ Wishlist toggle failed:", err);
      setToast({ message: "❌ Wishlist update failed!", type: "error" });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  // ✅ Handle Buy Now → Direct Checkout (No Add to Cart)
  const handleBuyNow = (productId: string) => {
    if (!session) return router.push("/login");
    setLoadingCheckout(productId); // ❤️ Show cute loader
    setTimeout(() => {
      router.push(`/checkout?productId=${productId}`);
    }, 1200);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900">{title}</h2>
          {showViewAll && (
            <Link href="/product" className="text-purple-600 font-semibold">
              View All →
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const productId = (product as any)._id || (product as any).id;
            const slug =
              typeof product.slug === "string"
                ? product.slug
                : typeof product.slug === "object" && product.slug?.current
                ? product.slug.current
                : null;

            return (
              <motion.div
                key={productId || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative"
              >
                {/* ✅ Wishlist Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleWishlist(productId)}
                  className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transition ${
                    wishlist.includes(productId)
                      ? "bg-pink-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Heart
                    size={18}
                    className={wishlist.includes(productId) ? "fill-current" : ""}
                  />
                </motion.button>

                {/* Product Image */}
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-72 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* ❤️ Cute Loader */}
                  {loadingCheckout === productId && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="text-pink-600 text-3xl font-bold"
                      >
                        ❤️
                      </motion.div>
                      <p className="text-gray-600 mt-2 text-sm font-medium">
                        Redirecting to Checkout...
                      </p>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="mt-3">
                  <h3 className="font-semibold text-lg text-gray-800 truncate">
                    {product.name}
                  </h3>
                  <p className="text-pink-600 font-bold">${product.price}</p>

                  <div className="flex gap-3 mt-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart(productId)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <ShoppingCart size={16} className="inline mr-1" /> Add to
                      Cart
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBuyNow(productId)}
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                    >
                      {loadingCheckout === productId ? (
                        <Loader2 className="animate-spin mx-auto" size={18} />
                      ) : (
                        <>
                          <Zap size={16} className="inline mr-1" /> Buy Now
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ✅ Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } animate-fadeIn`}
        >
          {toast.message}
          <button onClick={() => setToast(null)}>
            <X size={16} className="ml-2 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}
    </section>
  );
}
