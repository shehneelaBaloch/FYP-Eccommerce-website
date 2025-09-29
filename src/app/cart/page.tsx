"use client";

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch cart from API (with Sanity product details)
  const fetchCart = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cart/list?userId=${session.user.id}`);
      const data = await res.json();
      setCart(data || []);
    } catch (err) {
      console.error("❌ Fetch cart failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, qty: number) => {
    await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session?.user.id, productId, quantity: qty }),
    });
    fetchCart();
  };

  const removeFromCart = async (productId: string) => {
    await fetch(`/api/cart/remove?userId=${session?.user.id}&productId=${productId}`, {
      method: "DELETE",
    });
    fetchCart();
  };

  useEffect(() => {
    if (status === "authenticated") fetchCart();
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="p-10 text-center text-gray-600">Loading cart...</div>;
  }

  if (!session || cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <ShoppingBag size={64} className="mx-auto text-gray-400 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <Link
          href="/products"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:shadow-lg transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const getCartTotal = () =>
    cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <div className="min-h-screen py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-10">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div
                key={item._id}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition flex gap-6 items-center"
              >
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{item.product?.name}</h3>
                  <p className="text-purple-600 font-bold text-lg">
                    ${item.product?.price?.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.product?._id, -1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product?._id, 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Price & Remove */}
                <div className="text-right min-w-[90px]">
                  <p className="font-bold text-gray-900">
                    ${(item.product?.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.product?._id)}
                    className="text-red-500 hover:text-red-700 text-sm mt-2 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white p-8 rounded-2xl shadow-lg h-fit sticky top-8">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </div>
            <button className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
