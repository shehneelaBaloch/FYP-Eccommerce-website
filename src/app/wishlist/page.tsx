"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ShoppingCart,
  Trash2,
  Heart,
  CheckCircle2,
  X,
} from "lucide-react";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const userId = session?.user?.id;

  // ✅ Redirect if not logged in (optimized)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ✅ Memoized fetch wishlist
  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/wishlist/list?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      
      const data = await res.json();
      if (Array.isArray(data)) {
        setWishlist(data);
      }
    } catch (err) {
      console.error("❌ Failed to fetch wishlist:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ✅ Fetch wishlist only once when authenticated
  useEffect(() => {
    if (status === "authenticated" && userId) {
      fetchWishlist();
    }
  }, [status, userId, fetchWishlist]);

  // ✅ Optimized add to cart with loading state
  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    if (!session || !userId) {
      router.push("/login");
      return;
    }

    setAddingToCart(productId);
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
    } catch (err) {
      setToast({ message: "❌ Add to cart failed!", type: "error" });
    } finally {
      setAddingToCart(null);
      setTimeout(() => setToast(null), 3000);
    }
  }, [session, userId, router]);

  // ✅ Optimized remove from wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!userId) return;

    // Optimistic update
    const previousWishlist = [...wishlist];
    setWishlist(prev => prev.filter((item) => item.productId._id !== productId));

    try {
      const res = await fetch(`/api/wishlist/remove?userId=${userId}&productId=${productId}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setWishlist(previousWishlist);
        setToast({ message: "❌ Failed to remove item", type: "error" });
      } else {
        setToast({ message: "💔 Removed from wishlist", type: "success" });
      }
    } catch (err) {
      // Revert on error
      setWishlist(previousWishlist);
      console.error("❌ Remove wishlist failed:", err);
      setToast({ message: "❌ Remove failed", type: "error" });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  }, [userId, wishlist]);

  // ✅ Show loading only when actually loading and authenticated
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading your wishlist...
      </div>
    );
  }

  // ✅ Show login prompt if unauthenticated (briefly shows before redirect)
  if (status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        Redirecting to login...
      </div>
    );
  }

  // ✅ Empty state - only show when we have data and it's empty
  if (!loading && wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
        <Heart size={60} className="text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Wishlist is Empty 💔</h1>
        <p className="text-gray-600 mb-6">Add some items you love to keep track of them later.</p>
        <Link
          href="/products"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // ✅ Main Wishlist Page
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6 lg:px-12 mt-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-10 flex items-center gap-3">
          <Heart size={30} className="text-pink-600" /> 
          My Wishlist
          <span className="text-lg font-normal text-gray-500 ml-2">
            ({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})
          </span>
        </h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item: any) => {
            const product = item.productId;
            return (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col border border-gray-100"
              >
                {/* Image */}
                <div className="relative w-full h-56">
                  <Image
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    priority={false}
                  />
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/product/${product._id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                      {product.description || "No description available"}
                    </p>
                    <p className="text-pink-600 font-bold text-lg">
                      ${product.price?.toFixed(2) || "0.00"}
                    </p>
                  </div>

                  <button
                    onClick={() => addToCart(product._id)}
                    disabled={addingToCart === product._id}
                    className={`mt-4 w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                      addingToCart === product._id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg"
                    } text-white`}
                  >
                    {addingToCart === product._id ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} /> 
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } animate-fadeIn z-50`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <X size={16} />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2">
            <X size={16} className="opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}
    </div>
  );
}