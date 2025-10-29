"use client";

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // ✅ Memoized fetch cart function
  const fetchCart = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/cart/list?userId=${session.user.id}`);
      const data = await res.json();
      setCart(data || []);
    } catch (err) {
      console.error("❌ Fetch cart failed:", err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // ✅ Optimized quantity update with immediate UI feedback
  const updateQuantity = useCallback(async (productId: string, change: number) => {
    if (!session?.user?.id) return;

    const item = cart.find(item => item.product?._id === productId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    
    // Prevent negative quantities and remove if quantity becomes 0
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Immediate UI update
    setCart(prevCart => 
      prevCart.map(cartItem =>
        cartItem.product?._id === productId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: session.user.id, 
          productId, 
          quantity: change 
        }),
      });
    } catch (err) {
      console.error("Update quantity failed:", err);
      toast.error("Failed to update quantity");
      // Revert on error
      fetchCart();
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [session?.user?.id, cart, fetchCart]);

  // ✅ Optimized remove with immediate UI feedback
  const removeFromCart = useCallback(async (productId: string) => {
    if (!session?.user?.id) return;

    // Immediate UI update
    setCart(prevCart => 
      prevCart.filter(item => item.product?._id !== productId)
    );

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      await fetch(`/api/cart/remove?userId=${session.user.id}&productId=${productId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Remove from cart failed:", err);
      toast.error("Failed to remove item");
      // Revert on error
      fetchCart();
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [session?.user?.id, fetchCart]);

  // ✅ Fetch cart only when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchCart();
    }
  }, [status, fetchCart]);

  // ✅ Memoized cart calculations
  const getCartTotal = useCallback(() =>
    cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
  [cart]);

  const cartTotal = useMemo(() => getCartTotal(), [getCartTotal]);
  const isCartUpdating = useMemo(() => updatingItems.size > 0, [updatingItems.size]);

  // ✅ NEW: Redirect to checkout page instead of Stripe directly
  const handleCheckout = useCallback(async () => {
    if (!session?.user?.email) {
      toast.error("Please log in to proceed with checkout");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Redirect to checkout page with cart items
    router.push('/checkout?type=cart');
  }, [session?.user?.email, cart, router]);

  // ✅ Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // ✅ Empty cart state
  if (!session || cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-2xl border border-white/20">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8 text-lg max-w-md">
            Discover amazing products and add them to your cart to see them here!
          </p>
          <Link
            href="/products"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-gradient-to-br from-purple-50 to-pink-50">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-6">
            Shopping Cart
          </h1>
          <p className="text-gray-600 text-lg">
            Review your items and proceed to checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items Section */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => {
              const isUpdating = updatingItems.has(item.product?._id);
              const itemTotal = (item.product?.price || 0) * item.quantity;
              
              return (
                <div
                  key={item._id}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-200 border border-white/20 hover:border-white/40"
                >
                  <div className="flex gap-6 items-center">
                    {/* Product Image */}
                    <div className="w-28 h-28 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center overflow-hidden border border-white/30 shadow-inner">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="object-cover w-full h-full transition-transform hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <ShoppingBag size={32} className="text-purple-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-gray-900 mb-2 truncate">
                        {item.product?.name}
                      </h3>
                      <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ${item.product?.price?.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-2xl shadow-lg">
                        <button
                          onClick={() => updateQuantity(item.product?._id, -1)}
                          disabled={isUpdating}
                          className="p-1.5 hover:bg-white/20 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={18} className="text-white" />
                        </button>
                        <span className={`font-bold text-white min-w-8 text-center ${isUpdating ? 'opacity-50' : ''}`}>
                          {isUpdating ? "..." : item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product?._id, 1)}
                          disabled={isUpdating}
                          className="p-1.5 hover:bg-white/20 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={18} className="text-white" />
                        </button>
                      </div>
                      
                      {/* Item Total */}
                      <p className="font-bold text-gray-900 text-lg">
                        ${itemTotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product?._id)}
                      disabled={isUpdating}
                      className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Section */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl h-fit sticky top-8 border border-white/20">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Order Summary
            </h2>
            
            <div className="space-y-4 text-gray-700 mb-6">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
              
              <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent my-4"></div>
              
              <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total</span>
                <span className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCartUpdating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isCartUpdating ? "Updating..." : "Proceed to Checkout"}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Secure checkout with multiple payment options
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}