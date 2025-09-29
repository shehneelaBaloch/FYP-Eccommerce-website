"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Zap, X } from "lucide-react";
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

  // ✅ Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ✅ Add to Cart function
  const addToCart = async (productId: string, quantity = 1) => {
    if (!session) {
      router.push("/login");
      return;
    }

    const userId = session.user?.id;
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
        setToast({ message: "❌ Failed: " + (data.error || "Unknown error"), type: "error" });
      }

      // auto close toast after 3s
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ message: "❌ Add to cart failed!", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900">{title}</h2>
          {showViewAll && (
            <Link href="/products" className="text-purple-600 font-semibold">
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
                className="group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-72 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-pink-600 font-bold">${product.price}</p>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => addToCart(productId)}
                      className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition"
                    >
                      <ShoppingCart size={16} className="inline mr-1" /> Add to Cart
                    </button>
                    <button
                      onClick={async () => {
                        await addToCart(productId);
                        router.push("/cart");
                      }}
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                    >
                      <Zap size={16} className="inline mr-1" /> Buy Now
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ✅ Custom Toast */}
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
